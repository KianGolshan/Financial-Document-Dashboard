"""Migration: Add review/edit/mapping/normalization fields to financial tables.

Run from project root: python migrate_financial_v2.py

Adds to financial_statements:
  - review_status, reviewer_id, review_notes, locked
  - investment_id, reporting_date, fiscal_period_label

Adds to line_items:
  - edited_label, edited_value, is_user_modified, canonical_label

Creates new table:
  - edit_logs
"""

import sqlite3
import sys


def migrate(db_path: str = "finance.db"):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Helper: check if column exists
    def col_exists(table: str, column: str) -> bool:
        cur.execute(f"PRAGMA table_info({table})")
        return any(row[1] == column for row in cur.fetchall())

    # Helper: check if table exists
    def table_exists(table: str) -> bool:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        return cur.fetchone() is not None

    changes = 0

    # ── financial_statements additions ──
    fs_columns = {
        "review_status": "TEXT DEFAULT 'pending'",
        "reviewer_id": "TEXT",
        "review_notes": "TEXT",
        "locked": "INTEGER DEFAULT 0",
        "investment_id": "INTEGER REFERENCES investments(id)",
        "reporting_date": "TEXT",
        "fiscal_period_label": "TEXT",
    }
    for col, typedef in fs_columns.items():
        if not col_exists("financial_statements", col):
            cur.execute(f"ALTER TABLE financial_statements ADD COLUMN {col} {typedef}")
            print(f"  Added financial_statements.{col}")
            changes += 1

    # ── line_items additions ──
    li_columns = {
        "edited_label": "TEXT",
        "edited_value": "REAL",
        "is_user_modified": "INTEGER DEFAULT 0",
        "canonical_label": "TEXT",
    }
    for col, typedef in li_columns.items():
        if not col_exists("line_items", col):
            cur.execute(f"ALTER TABLE line_items ADD COLUMN {col} {typedef}")
            print(f"  Added line_items.{col}")
            changes += 1

    # ── edit_logs table ──
    if not table_exists("edit_logs"):
        cur.execute("""
            CREATE TABLE edit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                line_item_id INTEGER NOT NULL REFERENCES line_items(id),
                field TEXT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("  Created edit_logs table")
        changes += 1

    conn.commit()
    conn.close()

    if changes == 0:
        print("No migration needed — all columns/tables already exist.")
    else:
        print(f"Migration complete: {changes} change(s) applied.")


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "finance.db"
    print(f"Migrating {path}...")
    migrate(path)
