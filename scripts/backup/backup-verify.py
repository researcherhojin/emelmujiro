#!/usr/bin/env python3
# cspell:ignore tmpfs schemaname arcname outform
"""Create private backups and verify restoration without changing live databases."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import tarfile
import tempfile
import time
import uuid
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]


def run(args, **kwargs):
    return subprocess.run(args, check=True, timeout=300, **kwargs)


def restore_media(archive, destination):
    count = 0
    with tarfile.open(archive) as source:
        for entry in source:
            target = destination / entry.name
            if not target.resolve().is_relative_to(destination.resolve()):
                raise ValueError("Unsafe media archive path")
            if entry.isdir():
                target.mkdir(parents=True, exist_ok=True)
            elif entry.isfile():
                target.parent.mkdir(parents=True, exist_ok=True)
                with source.extractfile(entry) as incoming, target.open(
                    "wb"
                ) as outgoing:
                    shutil.copyfileobj(incoming, outgoing)
                if target.stat().st_size != entry.size:
                    raise ValueError("Incomplete media restoration")
                count += 1
            else:
                raise ValueError("Unsupported media archive entry")
    return count


def verify_sqlite(file):
    with sqlite3.connect("file:" + str(file) + "?mode=ro", uri=True) as db:
        if db.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
            raise ValueError("SQLite integrity verification failed")
        tables = {
            row[0]
            for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
        if not {"auth_user", "api_blogpost", "django_migrations"}.issubset(tables):
            raise ValueError("SQLite application tables are missing")
        return db.execute("SELECT count(*) FROM django_migrations").fetchone()[0]


def backup(destination, recipient):
    if not recipient.is_file():
        raise ValueError("Backup recipient certificate is required")
    os.umask(0o077)
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    stamp = (
        datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        + "-"
        + uuid.uuid4().hex[:8]
    )
    stage = Path(tempfile.mkdtemp(prefix=".pending-", dir=destination))
    name = "emelmujiro-restore-" + uuid.uuid4().hex[:12]
    container_file = "/tmp/" + name + ".sqlite3"
    restore_started = False
    try:
        code = (
            "import os, sqlite3; os.umask(0o077); "
            "source=sqlite3.connect('file:/app/data/db.sqlite3?mode=ro',uri=True); "
            "target=sqlite3.connect(" + repr(container_file) + "); "
            "source.backup(target); target.close(); source.close()"
        )
        run(["docker", "exec", "emelmujiro-backend", "python", "-c", code])
        run(
            [
                "docker",
                "cp",
                "emelmujiro-backend:" + container_file,
                str(stage / "app.sqlite3"),
            ],
            stdout=subprocess.DEVNULL,
        )
        run(
            [
                "docker",
                "exec",
                "emelmujiro-backend",
                "python",
                "-c",
                "import os; os.unlink(" + repr(container_file) + ")",
            ]
        )
        with (stage / "media.tar").open("wb") as out:
            run(
                [
                    "docker",
                    "exec",
                    "emelmujiro-backend",
                    "tar",
                    "-C",
                    "/app/media",
                    "-cf",
                    "-",
                    ".",
                ],
                stdout=out,
            )
        with (stage / "analytics.dump").open("wb") as out:
            run(
                [
                    "docker",
                    "exec",
                    "emelmujiro-umami-db",
                    "pg_dump",
                    "-U",
                    "umami",
                    "-d",
                    "umami",
                    "-Fc",
                ],
                stdout=out,
            )
        image = subprocess.check_output(
            ["docker", "inspect", "--format", "{{.Image}}", "emelmujiro-umami-db"],
            text=True,
            timeout=30,
        ).strip()
        if not image.startswith("sha256:"):
            raise ValueError("Missing database image identity")
        run(
            [
                "docker",
                "run",
                "--detach",
                "--name",
                name,
                "--network",
                "none",
                "--memory",
                "512m",
                "--tmpfs",
                "/var/lib/postgresql/data:rw,size=512m",
                "-e",
                "POSTGRES_HOST_AUTH_METHOD=trust",
                "-e",
                "POSTGRES_USER=umami",
                "-e",
                "POSTGRES_DB=restore",
                image,
            ],
            stdout=subprocess.DEVNULL,
        )
        restore_started = True
        for _ in range(30):
            ready = subprocess.run(
                ["docker", "exec", name, "pg_isready", "-U", "umami", "-d", "restore"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=10,
            )
            if ready.returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError("Isolated restore database did not start")
        with (stage / "analytics.dump").open("rb") as source:
            run(
                [
                    "docker",
                    "exec",
                    "-i",
                    name,
                    "pg_restore",
                    "-U",
                    "umami",
                    "-d",
                    "restore",
                    "--exit-on-error",
                    "--no-owner",
                    "--no-privileges",
                ],
                stdin=source,
            )
        tables = subprocess.check_output(
            [
                "docker",
                "exec",
                name,
                "psql",
                "-U",
                "umami",
                "-d",
                "restore",
                "-Atc",
                "SELECT tablename FROM pg_tables WHERE schemaname='public'",
            ],
            text=True,
            timeout=30,
        ).splitlines()
        if not {"website", "website_event", "session"}.issubset(set(tables)):
            raise ValueError("Restored analytics tables are missing")
        with tempfile.TemporaryDirectory(prefix="restore-", dir=destination) as scratch:
            restored = Path(scratch)
            shutil.copyfile(stage / "app.sqlite3", restored / "app.sqlite3")
            migrations = verify_sqlite(restored / "app.sqlite3")
            media_count = restore_media(stage / "media.tar", restored / "media")
        manifest = {
            "version": 1,
            "completedAt": datetime.now(timezone.utc).isoformat(),
            "verified": True,
            "sqliteMigrations": migrations,
            "mediaFiles": media_count,
            "analyticsTables": len(tables),
            "files": {},
        }
        for file in stage.iterdir():
            os.chmod(file, 0o600)
            digest = hashlib.sha256()
            with file.open("rb") as source:
                for block in iter(lambda: source.read(1024 * 1024), b""):
                    digest.update(block)
            manifest["files"][file.name] = {
                "bytes": file.stat().st_size,
                "sha256": digest.hexdigest(),
            }
        (stage / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
        plaintext = stage / "bundle.tar"
        with tarfile.open(plaintext, "w") as archive:
            for filename in (
                "app.sqlite3",
                "media.tar",
                "analytics.dump",
                "manifest.json",
            ):
                archive.add(stage / filename, arcname=filename)
        ciphertext = stage / "backup.cms"
        openssl = os.environ.get("BACKUP_OPENSSL", "openssl")
        run(
            [
                openssl,
                "cms",
                "-encrypt",
                "-binary",
                "-aes-256-gcm",
                "-in",
                str(plaintext),
                "-out",
                str(ciphertext),
                "-outform",
                "DER",
                str(recipient),
            ]
        )
        final = destination / (stamp + ".cms")
        ciphertext.rename(final)
        latest = destination / (".latest-" + stamp)
        latest.write_text(final.name + "\n")
        latest.replace(destination / "LATEST")
        print(
            json.dumps(
                {"backup": str(final), "verified": True, "mediaFiles": media_count}
            )
        )
        return final
    finally:
        # Cleanup paths are independent: a failed Docker command must never
        # prevent removal of host-side plaintext, or the container snapshot.
        try:
            if stage.exists():
                shutil.rmtree(stage)
        finally:
            try:
                run(
                    [
                        "docker",
                        "exec",
                        "emelmujiro-backend",
                        "python",
                        "-c",
                        "import os; p="
                        + repr(container_file)
                        + "; os.path.exists(p) and os.unlink(p)",
                    ]
                )
            finally:
                if restore_started:
                    run(["docker", "rm", "--force", name], stdout=subprocess.DEVNULL)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--destination", type=Path, default=ROOT / "backend/logs/security/backups"
    )
    parser.add_argument(
        "--recipient", type=Path, default=ROOT / ".private/backup-recipient.pem"
    )
    args = parser.parse_args()
    backup(args.destination.resolve(), args.recipient.resolve())
