#!/usr/bin/env python3
# cspell:ignore inkey
"""Fetch an encrypted backup, verify its contents locally, and acknowledge receipt."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import sqlite3
import subprocess
import tarfile
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True)
    parser.add_argument("--remote-root", required=True)
    parser.add_argument("--destination", type=Path, required=True)
    parser.add_argument("--key", type=Path, required=True)
    args = parser.parse_args()
    if args.host.startswith("-") or not re.fullmatch(r"[a-zA-Z0-9.@_-]+", args.host):
        raise ValueError("Invalid backup host")
    os.umask(0o077)
    args.destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    remote = args.remote_root.rstrip("/") + "/backend/logs/security"
    ssh = ["ssh", "-4", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", args.host]
    name = subprocess.check_output(
        ssh + ["cat " + shlex.quote(remote + "/backups/LATEST")], text=True, timeout=30
    ).strip()
    if not re.fullmatch(r"\d{8}T\d{6}Z-[a-f0-9]{8}\.cms", name):
        raise ValueError("Invalid backup identity")
    with tempfile.TemporaryDirectory(
        prefix=".verify-", dir=args.destination
    ) as directory:
        stage = Path(directory)
        ciphertext = stage / name
        with ciphertext.open("wb") as out:
            subprocess.run(
                ssh + ["cat " + shlex.quote(remote + "/backups/" + name)],
                check=True,
                stdout=out,
                timeout=300,
            )
        plaintext = stage / "bundle.tar"
        subprocess.run(
            [
                "openssl",
                "cms",
                "-decrypt",
                "-binary",
                "-inform",
                "DER",
                "-in",
                str(ciphertext),
                "-inkey",
                str(args.key),
                "-out",
                str(plaintext),
            ],
            check=True,
            timeout=300,
        )
        with tarfile.open(plaintext) as archive:
            expected = {"app.sqlite3", "media.tar", "analytics.dump", "manifest.json"}
            members = archive.getmembers()
            if len(members) != 4 or {member.name for member in members} != expected:
                raise ValueError("Unexpected backup inventory")
            for member in members:
                if not member.isfile():
                    raise ValueError("Unexpected backup entry")
                with archive.extractfile(member) as incoming, (
                    stage / member.name
                ).open("wb") as out:
                    while True:
                        block = incoming.read(1024 * 1024)
                        if not block:
                            break
                        out.write(block)
        manifest = json.loads((stage / "manifest.json").read_text())
        if manifest.get("verified") is not True or manifest.get("version") != 1:
            raise ValueError("Backup lacks restore verification")
        if set(manifest.get("files", {})) != expected - {"manifest.json"}:
            raise ValueError("Backup manifest inventory mismatch")
        for filename, entry in manifest["files"].items():
            file = stage / filename
            digest = hashlib.sha256()
            with file.open("rb") as source:
                for block in iter(lambda: source.read(1024 * 1024), b""):
                    digest.update(block)
            if (
                file.stat().st_size != entry["bytes"]
                or digest.hexdigest() != entry["sha256"]
            ):
                raise ValueError("Backup checksum mismatch")
        with sqlite3.connect(
            "file:" + str(stage / "app.sqlite3") + "?mode=ro", uri=True
        ) as db:
            if db.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
                raise ValueError("Restored SQLite integrity failure")
        ciphertext.replace(args.destination / name)
        receipt = json.dumps(
            {
                "version": 1,
                "completedAt": datetime.now(timezone.utc).isoformat(),
                "backup": name,
                "backedUpAt": manifest["completedAt"],
            }
        )
        temporary = remote + "/offsite.tmp"
        subprocess.run(
            ssh
            + [
                "umask 077; cat > "
                + shlex.quote(temporary)
                + " && mv "
                + shlex.quote(temporary)
                + " "
                + shlex.quote(remote + "/offsite.json")
            ],
            input=receipt,
            text=True,
            check=True,
            timeout=30,
        )
        print("Encrypted backup copied, decrypted, and verified on independent storage")


if __name__ == "__main__":
    main()
