#!/usr/bin/env python3
"""Manual protected-state regression tests; no live network/model calls."""
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import blog_state

SCRIPTS = Path(__file__).resolve().parents[1]

class ProtectedStateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='blog-security-', dir='/private/tmp' if Path('/private/tmp').exists() else '/tmp')
        self.root = Path(self.temp.name)
        self.state = self.root / 'state'
        self.env = dict(os.environ, LOCALNOMAD_BLOG_STATE_DIR=str(self.state), TMPDIR=str(self.root / 'forged-tmp'))

    def tearDown(self):
        self.temp.cleanup()

    def cmd(self, *args, good=True):
        result = subprocess.run(['bash', str(SCRIPTS/'blog-state.sh'), *args], env=self.env, capture_output=True, text=True)
        self.assertEqual(result.returncode == 0, good, result.stderr)
        return result

    def record(self):
        return self.state/'pipeline-state-test-post.json'

    def hook(self, publish=False, good=False, path=None, before="---\ndraft: true\n---\nBody", old="draft: true", new="draft: false", content="---\ndraft: true\n---\nBody"):
        path = path or str(self.root/'content/blog/test-post.mdx')
        if publish:
            target = Path(os.path.normpath(path))
            if not target.is_absolute():
                target = self.root/target
            # Absolute synthetic paths used by recognition-only tests stay unreadable and deny.
            if str(target).startswith(str(self.root)):
                target.parent.mkdir(parents=True,exist_ok=True)
                target.write_text(before)
        data = {'tool_name':'Edit' if publish else 'Write', 'tool_input':{'file_path':path, 'old_string':old, 'new_string':new, 'content':content}}
        result = subprocess.run(['python3', str(SCRIPTS/'hooks'/('blog-publish-gate.py' if publish else 'blog-write-gate.py'))], input=json.dumps(data), env=self.env, capture_output=True, text=True, cwd=self.root)
        self.assertEqual(result.returncode, 0)
        if good:
            self.assertEqual(result.stdout, '')
        else:
            self.assertEqual(json.loads(result.stdout)['hookSpecificOutput']['permissionDecision'], 'deny')

    def reports(self):
        reports = self.state/'stage4-reports'/'test-post'
        reports.mkdir(parents=True, mode=0o700)
        reports.parent.chmod(0o700)
        for n in range(6):
            file = reports/f'{n}.json'
            file.write_text('{"result":"PASS"}')
            file.chmod(0o600)
        return reports

    def stage3(self):
        self.cmd('init', 'test-post')
        self.cmd('advance', '2', 'test-post')
        self.cmd('checkpoint', 'cp1', 'test-post')
        self.cmd('advance', '3', 'test-post')

    def test_transitions_force_and_reset(self):
        self.cmd('init', 'test-post')
        self.assertEqual(self.state.stat().st_mode & 0o777, 0o700)
        self.assertEqual(self.record().stat().st_mode & 0o777, 0o600)
        self.hook()
        self.cmd('advance','3','test-post',good=False)
        self.cmd('advance','2','test-post')
        self.cmd('advance','3','test-post',good=False)
        self.cmd('checkpoint','cp2','test-post',good=False)
        self.cmd('checkpoint','cp1','test-post')
        self.cmd('advance','3','test-post')
        self.hook(good=True)
        self.hook(publish=True)
        self.reports()
        self.cmd('advance','4','test-post')
        self.cmd('checkpoint','cp2','test-post')
        self.cmd('advance','5','test-post')
        self.hook(publish=True,good=True)
        self.cmd('init','test-post','--force')
        self.assertFalse(json.loads(self.record().read_text())['cp1'])
        self.cmd('reset','test-post')
        self.assertFalse(self.record().exists())

    def test_symlink_and_force_reset_read_denied(self):
        self.cmd('init','test-post')
        outside = self.root/'outside'
        original = self.record().read_bytes()
        outside.write_bytes(original)
        outside.chmod(0o600)
        self.record().unlink()
        self.record().symlink_to(outside)
        for args in [('status','test-post'), ('init','test-post','--force'), ('reset','test-post'), ('checkpoint','cp1','test-post')]:
            self.cmd(*args,good=False)
        self.hook(); self.hook(publish=True)
        self.assertEqual(outside.read_bytes(),original)

    def test_unsafe_permissions_malformed_and_forged_state(self):
        self.cmd('init','test-post')
        original = self.record().read_bytes()
        self.record().chmod(0o644)
        self.cmd('status','test-post',good=False)
        self.hook(); self.hook(publish=True)
        self.record().chmod(0o600)
        for content in ['{', '{}', original.decode().replace('"stage": 1','"stage": true'), original.decode().replace('"cp2": false','"cp2": true')]:
            self.record().write_text(content)
            self.cmd('init','test-post','--force',good=False)
            self.cmd('reset','test-post',good=False)
            self.hook(); self.hook(publish=True)
        self.record().write_bytes(original)
        self.state.chmod(0o755)
        self.cmd('status','test-post',good=False)
        self.hook()

    def test_tmpdir_records_are_not_imported(self):
        forged = Path(self.env['TMPDIR'])/'blog-pipeline'
        forged.mkdir(parents=True)
        (forged/'pipeline-state-test-post.json').write_text('{"stage":5,"cp1":true,"cp2":true}')
        self.hook(); self.hook(publish=True)
        self.cmd('init','test-post')
        self.assertEqual(json.loads(self.record().read_text())['stage'],1)

    def test_directory_symlink_lock_hardlink_and_slug(self):
        outside = self.root/'outside-dir'
        outside.mkdir(mode=0o700)
        self.state.symlink_to(outside)
        self.cmd('init','test-post',good=False)
        self.assertEqual(list(outside.iterdir()),[])
        self.state.unlink()
        for slug in ('../escape','bad/name','Bad','', '-x'):
            self.cmd('init',slug,good=False)
        self.cmd('init','test-post')
        os.link(self.record(),self.root/'linked')
        self.cmd('status','test-post',good=False)
        (self.root/'linked').unlink()
        (self.state/'.lock').unlink()
        (self.state/'.lock').symlink_to(self.record())
        self.cmd('init','test-post','--force',good=False)
        self.hook()

    def test_report_validation(self):
        self.stage3()
        directory = self.reports()
        file = directory/'0.json'
        file.chmod(0o644)
        self.cmd('advance','4','test-post',good=False)
        file.chmod(0o600); file.write_text('not json')
        self.cmd('advance','4','test-post',good=False)
        for content in ('{"result":NaN}', '{"result":Infinity}', '{"result":1,"result":2}'):
            file.write_text(content)
            self.cmd('advance','4','test-post',good=False)
        outside = self.root/'outside-report'
        outside.write_text('{}'); outside.chmod(0o600)
        file.unlink(); file.symlink_to(outside)
        self.cmd('advance','4','test-post',good=False)
        self.assertEqual(outside.read_text(),'{}')
        file.unlink(); file.write_text('{}'); file.chmod(0o600)
        directory.chmod(0o755)
        self.cmd('advance','4','test-post',good=False)
        directory.chmod(0o700)
        self.cmd('advance','4','test-post')

    def test_concurrent_updates_serialize(self):
        self.cmd('init','test-post')
        def advance(_):
            return subprocess.run(['bash',str(SCRIPTS/'blog-state.sh'),'advance','2','test-post'],env=self.env,capture_output=True).returncode
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            codes = list(pool.map(advance,range(8)))
        self.assertEqual(codes.count(0),1)
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(lambda _: self.cmd('checkpoint','cp1','test-post'),range(8)))
        self.assertTrue(json.loads(self.record().read_text())['cp1'])
        self.assertEqual(json.loads(self.record().read_text())['stage'],2)

    def test_relative_and_normalized_blog_paths(self):
        for path in ('content/blog/tips/test-post.mdx','content/blog/ja/../tips/test-post.mdx','/repo/content/blog/ja/../tips/test-post.mdx'):
            self.hook(path=path)
            self.hook(publish=True,path=path)
        self.hook(path='content/blog/ja/test-post.mdx',good=True)

    def test_publication_syntax_partial_delete_and_whole_write(self):
        variants = [('draft: true','draft:  false'), ('true','false'), ('draft: true\n',''), ('draft: true','"draft": !!bool false'), ('draft: true','draft: FALSE')]
        for old,new in variants:
            self.hook(publish=True,old=old,new=new)
        self.hook(content='---\ndraft: false\n---\nBody')
        self.stage3()
        for old,new in variants:
            self.hook(publish=True,old=old,new=new)
        self.hook(content='---\ndraft: false\n---\nBody')
        self.hook(content='---\ntitle: Example\n---\nBody')
        self.reports(); self.cmd('advance','4','test-post'); self.cmd('checkpoint','cp2','test-post')
        for old,new in variants:
            self.hook(publish=True,old=old,new=new,good=True)
        self.hook(content='---\ndraft: false\n---\nBody',good=True)
        self.hook(content='---\ntitle: Example\n---\nBody',good=True)

    def test_unrelated_body_edits_and_direct_state_edit(self):
        self.hook(publish=True,before='---\ndraft: true\n---\ntrue',old='true',new='false')
        # An exact body-only replacement never changes the frontmatter approval status.
        self.hook(publish=True,before='---\ndraft: true\n---\nBody true',old='Body true',new='Body false',good=True)
        self.hook(publish=True,before='---\ndraft: false\n---\nBody',old='Body',new='Edited body',good=True)
        self.hook(publish=True,path=str(self.state/'pipeline-state-test-post.json'))
        self.hook(publish=True,before='---\ndraft: true\n---\nBody',old='missing',new='false')

    def test_translation_publication_and_existing_update(self):
        path = self.root/'content/blog/ja/test-post.mdx'
        path.parent.mkdir(parents=True)
        content = '---\ndraft: false\n---\nBody'
        self.hook(path=str(path),content=content)
        path.write_text('---\ndraft: true\n---\nBody')
        self.hook(path=str(path),content=content)
        path.write_text(content)
        self.hook(path=str(path),content=content,good=True)
        self.hook(publish=True,path=str(path))

    def test_frontmatter_parser_timeout_fails_closed(self):
        with mock.patch.object(blog_state.subprocess, 'run', side_effect=subprocess.TimeoutExpired('node',1)):
            with self.assertRaises(subprocess.TimeoutExpired):
                blog_state.publication_status('---\ndraft: false\n---')

    def test_wrong_owner_rejected(self):
        self.cmd('init','test-post')
        with open(self.record()) as stream:
            real = os.fstat(stream.fileno())
            changed = list(real)
            changed[4] = os.getuid()+1
            with mock.patch.object(blog_state.os, 'fstat', return_value=os.stat_result(changed)):
                with self.assertRaises(blog_state.StateError):
                    blog_state.verify(stream.fileno())
        fd = os.open(self.state, os.O_RDONLY | os.O_DIRECTORY)
        try:
            changed = list(os.fstat(fd)); changed[4] = os.getuid()+1
            with mock.patch.object(blog_state.os, 'fstat', return_value=os.stat_result(changed)):
                with self.assertRaises(blog_state.StateError):
                    blog_state.verify(fd,directory=True)
        finally:
            os.close(fd)

    def test_strict_umask(self):
        previous = os.umask(0o777)
        try:
            self.cmd('init','test-post')
            self.cmd('advance','2','test-post')
        finally:
            os.umask(previous)
        self.assertEqual(self.state.stat().st_mode & 0o777,0o700)
        self.assertEqual(self.record().stat().st_mode & 0o777,0o600)

    def test_absolute_override_and_default(self):
        self.env['LOCALNOMAD_BLOG_STATE_DIR']='relative'
        self.cmd('init','test-post',good=False)
        del self.env['LOCALNOMAD_BLOG_STATE_DIR']
        self.env['HOME']=str(self.root)
        self.cmd('init','test-post')
        self.assertTrue((self.root/'.local/state/localnomad/blog-pipeline/pipeline-state-test-post.json').exists())

if __name__ == '__main__':
    unittest.main()
