#!/usr/bin/env python3
"""
Exports the four dbt marts from transform/dev.duckdb to static JSON files
under app/public/data/, for the Vite/React dashboard to fetch at build/run
time (this repo is not wired up to a live warehouse -- it's a static
snapshot of the dbt build for the frontend to render).

Run (after `dbt seed && dbt run` has populated transform/dev.duckdb):
    python3 scripts/export_marts_to_json.py
"""
import datetime
import decimal
import json
from pathlib import Path

import duckdb

REPO_ROOT = Path(__file__).resolve().parent.parent
DUCKDB_PATH = REPO_ROOT / "transform" / "dev.duckdb"
OUTPUT_DIR = REPO_ROOT / "app" / "public" / "data"

MARTS = [
    "fct_claims",
    "fct_member_cases",
    "fct_campaign_performance",
    "fct_document_inventory",
]


def json_default(value):
    """Serialize dates/datetimes as ISO strings and decimals as floats."""
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value.isoformat()
    if isinstance(value, decimal.Decimal):
        return float(value)
    raise TypeError(f"Object of type {type(value)} is not JSON serializable: {value!r}")


def export_mart(con: duckdb.DuckDBPyConnection, mart_name: str) -> None:
    relation = con.sql(f"select * from main.{mart_name}")
    columns = relation.columns
    rows = relation.fetchall()

    records = [dict(zip(columns, row)) for row in rows]

    output_path = OUTPUT_DIR / f"{mart_name}.json"
    with output_path.open("w") as f:
        json.dump(records, f, default=json_default, indent=2)

    print(f"wrote {len(records)} rows -> {output_path.relative_to(REPO_ROOT)}")


def main():
    if not DUCKDB_PATH.exists():
        raise SystemExit(
            f"{DUCKDB_PATH} not found. Run `dbt seed && dbt run` from transform/ first."
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    con = duckdb.connect(str(DUCKDB_PATH), read_only=True)
    try:
        for mart_name in MARTS:
            export_mart(con, mart_name)
    finally:
        con.close()

    print("done.")


if __name__ == "__main__":
    main()
