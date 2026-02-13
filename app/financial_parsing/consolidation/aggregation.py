"""Period aggregation engine for financial statements.

Groups statements by investment and date, merges duplicates,
and aligns line items across periods for comparison.
"""

from sqlalchemy.orm import Session

from app.financial_parsing.models import FinancialStatement, LineItem


def group_by_investment_and_date(
    db: Session, investment_id: int,
) -> dict[str, list[FinancialStatement]]:
    """Group statements by statement_type, ordered by reporting_date."""
    stmts = db.query(FinancialStatement).filter(
        FinancialStatement.investment_id == investment_id
    ).order_by(
        FinancialStatement.statement_type,
        FinancialStatement.reporting_date,
    ).all()

    groups: dict[str, list[FinancialStatement]] = {}
    for stmt in stmts:
        groups.setdefault(stmt.statement_type, []).append(stmt)
    return groups


def merge_duplicate_statements(
    db: Session, investment_id: int,
) -> int:
    """Merge statements with same (type, period, investment_id).
    Keeps the one with more line items, deletes the other. Returns count merged."""
    stmts = db.query(FinancialStatement).filter(
        FinancialStatement.investment_id == investment_id
    ).all()

    # Group by (type, period)
    by_key: dict[tuple, list[FinancialStatement]] = {}
    for s in stmts:
        key = (s.statement_type, s.period)
        by_key.setdefault(key, []).append(s)

    merged_count = 0
    for key, group in by_key.items():
        if len(group) <= 1:
            continue
        # Keep the one with the most line items
        group.sort(key=lambda s: len(s.line_items), reverse=True)
        keeper = group[0]
        for dupe in group[1:]:
            db.delete(dupe)
            merged_count += 1

    if merged_count > 0:
        db.commit()
    return merged_count


def align_line_items_across_periods(
    statements: list[FinancialStatement],
) -> dict:
    """Align line items across multiple periods of the same statement type.

    Returns:
        {
            "periods": ["Q1 2023", "Q2 2023", ...],
            "rows": [
                {
                    "canonical_label": "Revenue",
                    "category": "revenue",
                    "is_total": false,
                    "indent_level": 0,
                    "values": {
                        "Q1 2023": 1000.0,
                        "Q2 2023": 1200.0,
                    }
                },
                ...
            ]
        }
    """
    if not statements:
        return {"periods": [], "rows": []}

    periods = []
    for s in statements:
        label = s.fiscal_period_label or s.period
        if label not in periods:
            periods.append(label)

    # Collect all unique line items by canonical_label (or label fallback)
    row_order: list[str] = []
    row_meta: dict[str, dict] = {}
    row_values: dict[str, dict[str, float | None]] = {}

    for stmt in statements:
        period_label = stmt.fiscal_period_label or stmt.period
        for li in stmt.line_items:
            key = li.canonical_label or li.edited_label or li.label
            if key not in row_meta:
                row_order.append(key)
                row_meta[key] = {
                    "canonical_label": key,
                    "category": li.category,
                    "is_total": li.is_total,
                    "indent_level": li.indent_level,
                }
                row_values[key] = {}
            # Use edited value if available
            val = li.edited_value if li.edited_value is not None else li.value
            row_values[key][period_label] = val

    rows = []
    for key in row_order:
        row = {**row_meta[key], "values": row_values[key]}
        rows.append(row)

    return {"periods": periods, "rows": rows}


def build_comparison_dataset(
    db: Session, investment_id: int,
) -> dict:
    """Build full comparison dataset for an investment.

    Returns:
        {
            "investment_id": 1,
            "statement_types": {
                "income_statement": {
                    "periods": [...],
                    "rows": [...]
                },
                ...
            },
            "normalized_metrics": {
                "Revenue": {"Q1 2023": 1000, "Q2 2023": 1200},
                ...
            }
        }
    """
    groups = group_by_investment_and_date(db, investment_id)
    statement_types = {}
    all_metrics: dict[str, dict[str, float | None]] = {}

    for stmt_type, stmts in groups.items():
        aligned = align_line_items_across_periods(stmts)
        statement_types[stmt_type] = aligned

        # Collect into normalized_metrics (flatten across types)
        for row in aligned["rows"]:
            label = row["canonical_label"]
            if label not in all_metrics:
                all_metrics[label] = {}
            all_metrics[label].update(row["values"])

    return {
        "investment_id": investment_id,
        "statement_types": statement_types,
        "normalized_metrics": all_metrics,
    }
