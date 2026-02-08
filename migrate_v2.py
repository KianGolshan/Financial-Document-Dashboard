"""
One-time migration script: v1 -> v2
  - Creates `securities` table
  - Adds `asset_type` and `notes` columns to `investments`
  - Adds `security_id` FK column to `documents`
  - Migrates existing `series` values into Security records and links documents
"""

import sqlite3
import sys
from datetime import datetime

DB_PATH = "finance.db"


def migrate(db_path: str = DB_PATH) -> None:
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = OFF")
    cur = conn.cursor()

    try:
        # ── 1. Create securities table ──────────────────────────────────
        cur.execute("""
            CREATE TABLE IF NOT EXISTS securities (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                investment_id INTEGER NOT NULL REFERENCES investments(id),
                description TEXT,
                investment_round TEXT,
                investment_date TEXT,
                investment_size REAL,
                price_per_share REAL,
                notes       TEXT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("[OK] Created securities table")

        # ── 2. Add columns to investments ───────────────────────────────
        existing_cols = {
            row[1] for row in cur.execute("PRAGMA table_info(investments)").fetchall()
        }
        if "asset_type" not in existing_cols:
            cur.execute("ALTER TABLE investments ADD COLUMN asset_type TEXT")
            print("[OK] Added asset_type to investments")
        if "notes" not in existing_cols:
            cur.execute("ALTER TABLE investments ADD COLUMN notes TEXT")
            print("[OK] Added notes to investments")

        # ── 3. Add security_id column to documents ─────────────────────
        doc_cols = {
            row[1] for row in cur.execute("PRAGMA table_info(documents)").fetchall()
        }
        if "security_id" not in doc_cols:
            cur.execute("ALTER TABLE documents ADD COLUMN security_id INTEGER REFERENCES securities(id)")
            print("[OK] Added security_id to documents")

        # ── 4. Migrate series values ────────────────────────────────────
        # For each investment that has a series value, create a Security
        # and link all its documents to that security.
        cur.execute("SELECT id, series FROM investments WHERE series IS NOT NULL AND series != ''")
        investments_with_series = cur.fetchall()

        migrated_count = 0
        now = datetime.utcnow().isoformat()
        for inv_id, series_val in investments_with_series:
            # Check if a security already exists for this investment with this round
            cur.execute(
                "SELECT id FROM securities WHERE investment_id = ? AND investment_round = ?",
                (inv_id, series_val),
            )
            existing = cur.fetchone()
            if existing:
                sec_id = existing[0]
            else:
                cur.execute(
                    "INSERT INTO securities (investment_id, investment_round, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                    (inv_id, series_val, series_val, now, now),
                )
                sec_id = cur.lastrowid
                migrated_count += 1

            # Link documents that belong to this investment to the new security
            cur.execute(
                "UPDATE documents SET security_id = ? WHERE investment_id = ? AND security_id IS NULL",
                (sec_id, inv_id),
            )

        print(f"[OK] Migrated {migrated_count} series values into securities")

        conn.commit()
        print("\nMigration completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Migration failed: {e}", file=sys.stderr)
        raise
    finally:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.close()


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else DB_PATH
    migrate(path)
