#!/usr/bin/env python3
"""Protected interactive checkpoints. Never imports temporary legacy state."""
import contextlib
import datetime
import fcntl
import json
import os
import re
import secrets
import stat
import sys
import subprocess
from pathlib import Path

class StateError(ValueError):
    pass

SLUG = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*\Z')

def slug_check(slug):
    if not isinstance(slug, str) or len(slug) > 180 or not SLUG.fullmatch(slug):
        raise StateError('Invalid blog slug')
    return slug

def blog_path(file_path):
    """Recognize relative and absolute blog targets after lexical normalization."""
    if not isinstance(file_path, str):
        raise StateError('Invalid file path')
    path = os.path.normpath(file_path)
    parts = path.split(os.sep)
    for index in range(len(parts)-1):
        if parts[index:index+2] == ['content', 'blog']:
            remainder = parts[index+2:]
            return path.endswith('.mdx'), bool(remainder and remainder[0] in ('ja','zh-cn'))
    return False, False

def protected_state_path(path):
    basename = os.path.basename(os.path.normpath(path))
    return 'pipeline-state' in basename and basename.endswith('.json')


def publication_status(content):
    """Use the repository's YAML engine, never execute frontmatter JavaScript."""
    if not isinstance(content, str):
        raise StateError('Missing document content')
    code = r"""
const fs = require('node:fs');
const matter = require('gray-matter');
const denied = () => { throw new Error('Executable frontmatter is forbidden'); };
try {
  const data = matter(JSON.parse(fs.readFileSync(0, 'utf8')), {
    engines: { javascript: denied, js: denied }
  }).data;
  if (data.draft !== undefined && typeof data.draft !== 'boolean') throw new Error('Invalid draft field');
  process.stdout.write(JSON.stringify(data.draft !== true));
} catch (_) { process.exit(1); }
"""
    result = subprocess.run(['node','-e',code], input=json.dumps(content), text=True,
                            capture_output=True, cwd=Path(__file__).resolve().parents[1], timeout=1)
    if result.returncode or result.stdout not in ('true','false'):
        raise StateError('Cannot determine publication from frontmatter')
    return result.stdout == 'true'


def read_blog_document(path):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise StateError('Blog document must be a regular file')
        with os.fdopen(os.dup(fd), 'r') as stream:
            before = stream.read(4 * 1024 * 1024 + 1)
        if len(before) > 4 * 1024 * 1024:
            raise StateError('Oversized blog document')
    finally:
        os.close(fd)
    return before


def edit_publishes(tool_input):
    before = read_blog_document(tool_input['file_path'])
    old, new = tool_input.get('old_string'), tool_input.get('new_string')
    if not isinstance(old,str) or not old or not isinstance(new,str):
        raise StateError('Invalid edit strings')
    count = before.count(old)
    if not count or (count != 1 and tool_input.get('replace_all') is not True):
        raise StateError('Cannot determine the resulting edit')
    after = before.replace(old,new) if tool_input.get('replace_all') is True else before.replace(old,new,1)
    return publication_status(after) and not publication_status(before)


def require_publication_approval(slug):
    state = read_state(slug)
    if not state['cp2'] or state['stage'] < 4:
        raise StateError('CP2 approval required for publication')

def state_directory():
    path = os.environ.get('LOCALNOMAD_BLOG_STATE_DIR', os.path.join(os.path.expanduser('~'), '.local/state/localnomad/blog-pipeline'))
    if not os.path.isabs(path) or '..' in path.split('/'):
        raise StateError('State directory must be absolute without parent traversal')
    return path

def verify(fd, directory=False, private=True):
    st = os.fstat(fd)
    if (not stat.S_ISDIR(st.st_mode) if directory else not stat.S_ISREG(st.st_mode)):
        raise StateError('Unsafe state object type')
    if private:
        if st.st_uid != os.getuid() or stat.S_IMODE(st.st_mode) != (0o700 if directory else 0o600):
            raise StateError('Unsafe state ownership or permissions')
        if not directory and st.st_nlink != 1:
            raise StateError('Hard-linked state files are forbidden')
    return st

@contextlib.contextmanager
def directory(path=None, create=False):
    path = path or state_directory()
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        parts = [p for p in path.split('/') if p]
        for index, part in enumerate(parts):
            try:
                next_fd = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            except FileNotFoundError:
                if not create:
                    raise StateError('No protected state directory; initialize the pipeline')
                previous_mask = os.umask(0o077)
                try:
                    try:
                        os.mkdir(part, 0o700, dir_fd=fd)
                    except FileExistsError:
                        pass  # Another initializer won; the no-follow open below verifies it.
                finally:
                    os.umask(previous_mask)
                next_fd = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = next_fd
            st = verify(fd, directory=True, private=index == len(parts)-1)
            if index != len(parts)-1:
                # Root-owned sticky temporary parents are permitted for explicit test configuration.
                if st.st_uid not in (0, os.getuid()) or (st.st_mode & 0o022 and not st.st_mode & stat.S_ISVTX):
                    raise StateError('Unsafe ancestor directory')
        yield fd
    finally:
        os.close(fd)

def read_json(fd, name):
    handle = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
    try:
        verify(handle)
        with os.fdopen(os.dup(handle), 'r') as stream:
            raw = stream.read(1024 * 1024 + 1)
        if len(raw) > 1024 * 1024:
            raise StateError('Oversized state record')
        def pairs(items):
            result = {}
            for key, value in items:
                if key in result:
                    raise StateError('Duplicate JSON key')
                result[key] = value
            return result
        def invalid_constant(value):
            raise StateError('Non-finite JSON constants are forbidden')
        data = json.loads(raw, object_pairs_hook=pairs, parse_constant=invalid_constant)
        if not isinstance(data, dict):
            raise StateError('Record must be a JSON object')
        return data
    finally:
        os.close(handle)

def record(fd, slug):
    data = read_json(fd, f'pipeline-state-{slug_check(slug)}.json')
    if set(data) != {'slug', 'stage', 'cp1', 'cp2', 'started_at'} or data['slug'] != slug:
        raise StateError('Malformed pipeline record')
    stage = data['stage']
    if type(stage) is not int or stage not in range(1, 6) or type(data['cp1']) is not bool or type(data['cp2']) is not bool:
        raise StateError('Malformed stage or checkpoint')
    if (stage >= 3 and not data['cp1']) or (stage >= 5 and not data['cp2']) or (stage < 2 and data['cp1']) or (stage < 4 and data['cp2']):
        raise StateError('Inconsistent checkpoints')
    if not isinstance(data['started_at'], str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z', data['started_at']):
        raise StateError('Malformed timestamp')
    datetime.datetime.strptime(data['started_at'], '%Y-%m-%dT%H:%M:%SZ')
    return data

@contextlib.contextmanager
def locked(create=False):
    with directory(create=create) as fd:
        previous_mask = os.umask(0o077)
        try:
            lock = os.open('.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW | os.O_NONBLOCK, 0o600, dir_fd=fd)
        finally:
            os.umask(previous_mask)
        try:
            verify(lock)
            fcntl.flock(lock, fcntl.LOCK_EX)
            yield fd
        finally:
            os.close(lock)

def read_state(slug):
    with locked() as fd:
        return record(fd, slug)

def replace(fd, slug, data):
    name = '.state-' + secrets.token_hex(16)
    previous_mask = os.umask(0o077)
    try:
        handle = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=fd)
    finally:
        os.umask(previous_mask)
    try:
        with os.fdopen(handle, 'w') as stream:
            json.dump(data, stream, indent=2)
            stream.write('\n')
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, f'pipeline-state-{slug}.json', src_dir_fd=fd, dst_dir_fd=fd)
        os.fsync(fd)
    finally:
        try:
            os.unlink(name, dir_fd=fd)
        except FileNotFoundError:
            pass

def reports(fd, slug):
    handles = []
    try:
        for part in ('stage4-reports', slug):
            fd = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            handles.append(fd)
            verify(fd, directory=True)
        names = [n for n in os.listdir(fd) if n.endswith('.json')]
        for name in names:
            read_json(fd, name)
        if len(names) < 6:
            raise StateError('Stage 4 requires at least six protected JSON reports')
    finally:
        for handle in reversed(handles):
            os.close(handle)

def main(args):
    if not args:
        raise StateError('Usage: blog-state.sh init|advance|checkpoint|status|reset|list [args]')
    cmd, *rest = args
    if cmd == 'init':
        force = '--force' in rest
        slugs = [a for a in rest if a != '--force']
        if len(slugs) != 1 or rest.count('--force') > 1:
            raise StateError('init requires <slug> [--force]')
        slug = slug_check(slugs[0])
        with locked(create=True) as fd:
            try:
                record(fd, slug)  # Force never bypasses existing-object validation.
            except FileNotFoundError:
                pass
            else:
                if not force:
                    raise StateError('State already exists; use --force')
            replace(fd, slug, dict(slug=slug, stage=1, cp1=False, cp2=False, started_at=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')))
    elif cmd in ('status', 'list'):
        if len(rest) > (1 if cmd == 'status' else 0):
            raise StateError('Invalid arguments')
        with locked() as fd:
            names = sorted(n for n in os.listdir(fd) if n.startswith('pipeline-state-') and n.endswith('.json'))
            slugs = rest or [n[len('pipeline-state-'):-5] for n in names]
            for slug in slugs:
                data = record(fd, slug)
                print(os.path.join(state_directory(), f'pipeline-state-{slug}.json') if cmd == 'list' else json.dumps(data, indent=2))
            if not slugs:
                print('No active pipeline states found.')
    elif cmd in ('advance', 'checkpoint', 'reset'):
        if len(rest) != (1 if cmd == 'reset' else 2):
            raise StateError('Invalid arguments')
        slug = slug_check(rest[-1])
        with locked() as fd:
            data = record(fd, slug)
            if cmd == 'reset':
                os.unlink(f'pipeline-state-{slug}.json', dir_fd=fd)
                os.fsync(fd)
            else:
                if cmd == 'checkpoint':
                    cp = rest[0]
                    if cp not in ('cp1', 'cp2') or data['stage'] < (2 if cp == 'cp1' else 4):
                        raise StateError('Checkpoint stage requirement not met')
                    data[cp] = True
                else:
                    target = int(rest[0])
                    if target not in (2,3,4,5) or data['stage'] != target-1:
                        raise StateError('Invalid stage transition')
                    if target == 3 and not data['cp1'] or target == 5 and not data['cp2']:
                        raise StateError('Checkpoint approval required')
                    if target == 4:
                        reports(fd, slug)
                    data['stage'] = target
                replace(fd, slug, data)
    else:
        raise StateError('Unknown command')
    if cmd not in ('status', 'list'):
        print(f'OK: {cmd} completed for {slug}')

if __name__ == '__main__':
    try:
        main(sys.argv[1:])
    except (OSError, ValueError, TypeError, KeyError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        sys.exit(1)
