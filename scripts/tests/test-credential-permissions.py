#!/usr/bin/env python3
"""Manual metadata-only credential checks; never reads credential values."""
import os
from pathlib import Path
import stat
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]


class CredentialPermissionsTest(unittest.TestCase):
    def test_private_local_credentials(self):
        for name in ('.env.local', '.mcp.json'):
            with self.subTest(file=name):
                path = ROOT / name
                metadata = path.lstat()
                self.assertTrue(stat.S_ISREG(metadata.st_mode), 'must be a regular file')
                self.assertEqual(metadata.st_uid, os.getuid(), 'must belong to operator')
                self.assertEqual(metadata.st_nlink, 1, 'must have one link')
                self.assertEqual(stat.S_IMODE(metadata.st_mode), 0o600)
                if sys.platform == 'darwin':
                    result = subprocess.run(['ls', '-lde', str(path)], capture_output=True,
                                            text=True, check=True)
                    self.assertEqual(len(result.stdout.splitlines()), 1, 'unexpected file ACL')
                else:
                    result = subprocess.run(['getfacl', '-cp', str(path)], capture_output=True,
                                            text=True, check=True)
                    self.assertEqual(set(result.stdout.split()),
                                     {'user::rw-', 'group::---', 'other::---'})
                ignored = subprocess.run(['git', 'check-ignore', '-q', name], cwd=ROOT)
                self.assertEqual(ignored.returncode, 0, 'credential file must remain ignored')


if __name__ == '__main__':
    unittest.main()
