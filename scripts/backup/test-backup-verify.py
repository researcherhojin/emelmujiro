import importlib.util
import io
from pathlib import Path
import sqlite3
import tarfile
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace
import sys

# Loading backup-verify.py by path would otherwise leave a __pycache__ in scripts/.
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location(
    "backup_verify", Path(__file__).with_name("backup-verify.py")
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class BackupVerificationTests(unittest.TestCase):
    def test_media_restore_and_traversal_rejection(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ("images/test.txt", "../../escape.txt"):
                archive = root / "media.tar"
                with tarfile.open(archive, "w") as output:
                    entry = tarfile.TarInfo(name)
                    entry.size = 4
                    output.addfile(entry, io.BytesIO(b"test"))
                if name.startswith("images"):
                    self.assertEqual(module.restore_media(archive, root / "restore"), 1)
                    self.assertEqual(
                        (root / "restore/images/test.txt").read_bytes(), b"test"
                    )
                else:
                    with self.assertRaises(ValueError):
                        module.restore_media(archive, root / "restore")

    def test_sqlite_checks_application_schema(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "app.sqlite3"
            with sqlite3.connect(file) as db:
                db.execute("CREATE TABLE django_migrations (id INTEGER)")
            with self.assertRaises(ValueError):
                module.verify_sqlite(file)
            with sqlite3.connect(file) as db:
                db.execute("CREATE TABLE auth_user (id INTEGER)")
                db.execute("CREATE TABLE api_blogpost (id INTEGER)")
            self.assertEqual(module.verify_sqlite(file), 0)
            file.write_bytes(b"corrupted")
            with self.assertRaises(sqlite3.DatabaseError):
                module.verify_sqlite(file)


class BackupCleanupTests(unittest.TestCase):
    def test_copy_failure_removes_both_plaintext_locations(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            recipient = root / "recipient.pem"
            recipient.write_text("fixture")
            calls = []

            def run(args, **kwargs):
                calls.append(args)
                if args[:2] == ["docker", "cp"]:
                    raise RuntimeError("copy failed")

            with patch.object(module, "run", side_effect=run):
                with self.assertRaises(RuntimeError):
                    module.backup(root / "archives", recipient)
            self.assertIn("os.umask(0o077)", calls[0][-1])
            self.assertIn("os.unlink(p)", calls[-1][-1])
            self.assertEqual(list((root / "archives").iterdir()), [])

    def test_container_cleanup_failure_cannot_leave_host_plaintext(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            recipient = root / "recipient.pem"
            recipient.write_text("fixture")

            def run(args, **kwargs):
                if args[:2] == ["docker", "cp"]:
                    Path(args[-1]).write_bytes(b"fixture database")
                if "-encrypt" in args:
                    Path(args[args.index("-out") + 1]).write_bytes(b"encrypted fixture")
                if args[:2] == ["docker", "rm"]:
                    raise RuntimeError("cleanup failed")

            with (
                patch.object(module, "run", side_effect=run),
                patch.object(
                    module.subprocess, "run", return_value=SimpleNamespace(returncode=0)
                ),
                patch.object(
                    module.subprocess,
                    "check_output",
                    side_effect=[
                        "sha256:" + "a" * 64,
                        "website\nwebsite_event\nsession",
                    ],
                ),
                patch.object(module, "verify_sqlite", return_value=1),
                patch.object(module, "restore_media", return_value=0),
            ):
                with self.assertRaises(RuntimeError):
                    module.backup(root / "archives", recipient)
            self.assertFalse(
                any(
                    path.name.startswith(".pending-")
                    for path in (root / "archives").iterdir()
                )
            )


if __name__ == "__main__":
    unittest.main()
