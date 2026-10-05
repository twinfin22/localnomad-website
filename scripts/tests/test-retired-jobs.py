#!/usr/bin/env python3
"""Manual offline regression: python3 scripts/tests/test-retired-jobs.py."""
import ast
import hashlib
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
ENTRYPOINTS = (
    'scripts/cron/reddit-karma-daily.sh',
    'scripts/cron/weekly-blog-update.sh',
    'scripts/cron/weekly-gen-report.sh',
    'scripts/cron/weekly-reflect.sh',  # Also held the nested signal/noise job.
    'scripts/cron/missed-jobs-check.sh',
    'scripts/cron/send-telegram.sh',
    'scripts/seo/seo-pulse.sh',
)
WORKFLOWS = ('seo-pulse.yml', 'reddit-draft-notify.yml', 'reddit-karma-watchdog.yml')


def snapshot(path):
    """Include directories and file bytes, so even empty output dirs are detected."""
    return {str(p.relative_to(path)): ('directory' if p.is_dir() else
            hashlib.sha256(p.read_bytes()).hexdigest())
            for p in path.rglob('*')}


class RetiredJobsTest(unittest.TestCase):
    def test_stale_invocations_are_quiet_and_have_no_effects(self):
        # No live command is reachable through PATH: all external tools are mocks.
        with tempfile.TemporaryDirectory(prefix='localnomad-retirement-') as temp:
            base = Path(temp)
            home = base / 'home'
            project = home / 'localnomad/b2c-website'
            mockbin = base / 'bin'
            mockbin.mkdir()
            for directory in ('docs/human', 'drafts', 'logs/cron', 'memory'):
                output = project / directory / 'preserved.txt'
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_text('existing output must stay unchanged\n')
            calls = base / 'unexpected-calls'
            for command in ('claude', 'codex', 'curl', 'wget', 'node', 'python3',
                            'git', 'osascript', 'jq', 'send-telegram.sh', 'date',
                            'mkdir', 'touch', 'rm', 'mv', 'cat', 'head', 'env'):
                mock = mockbin / command
                mock.write_text('#!/bin/bash\nprintf "%s\\n" "$0" >> "$MOCK_CALLS"\nexit 99\n')
                mock.chmod(0o755)
            env = dict(os.environ, HOME=str(home), TMPDIR=str(base),
                       PATH=str(mockbin), MOCK_CALLS=str(calls),
                       BASH_ENV='/dev/null', ENV='/dev/null')
            before = snapshot(base)
            real_outputs = {name: snapshot(ROOT / name) for name in ('docs/human', 'drafts', 'logs')
                            if (ROOT / name).is_dir()}
            for relative in ENTRYPOINTS:
                for args in ([], ['--dry-run', '--days', '28'],
                             ['title', str(project / 'docs/human/preserved.txt'), 'PLAIN']):
                    with self.subTest(entrypoint=relative, args=args):
                        result = subprocess.run(['/bin/bash', str(ROOT / relative), *args],
                                                cwd=project, env=env, input='untrusted input\n',
                                                text=True, capture_output=True, timeout=5)
                        self.assertEqual(result.returncode, 0)
                        self.assertEqual(result.stdout, '')
                        self.assertEqual(result.stderr, '')
                        self.assertEqual(snapshot(base), before)
            self.assertFalse(calls.exists())
            for name, previous in real_outputs.items():
                self.assertEqual(snapshot(ROOT / name), previous)

    def test_workflows_removed(self):
        for name in WORKFLOWS:
            self.assertFalse((ROOT / '.github/workflows' / name).exists(), name)

    def test_formatter_has_only_local_operations(self):
        formatter = ROOT / 'scripts/cron/format-tg.py'
        tree = ast.parse(formatter.read_text())
        imports = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imports.update(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom):
                imports.add(node.module)
        self.assertEqual(imports, {'sys', 're', 'argparse'})
        self.assertNotIn('send_telegram', {node.name for node in ast.walk(tree)
                                         if isinstance(node, ast.FunctionDef)})
        self.assertNotIn('api.telegram.org', formatter.read_text())
        formatted = subprocess.run([sys.executable, str(formatter)], input='# Heading\n**bold**',
                                   text=True, capture_output=True, timeout=5)
        self.assertEqual(formatted.returncode, 0)
        self.assertIn('<b>Heading</b>', formatted.stdout)
        self.assertIn('<b>bold</b>', formatted.stdout)
        split = subprocess.run([sys.executable, str(formatter), '--split'],
                               input=('paragraph\n\n' * 600), text=True,
                               capture_output=True, timeout=5)
        self.assertEqual(split.returncode, 0)
        self.assertIn('---TG_SPLIT---', split.stdout)
        # Retired credential arguments cannot select a sending path; values are synthetic.
        rejected = subprocess.run([sys.executable, str(formatter), '--send',
                                   'title', 'synthetic-token', 'synthetic-chat'],
                                  text=True, capture_output=True, timeout=5)
        self.assertEqual(rejected.returncode, 2)
        self.assertEqual(rejected.stdout, '')


if __name__ == '__main__':
    unittest.main()
