"""Label normalization layer for financial line items.

Maps varied labels from extracted statements to canonical metric names,
enabling cross-document and cross-period comparison.
"""

from sqlalchemy.orm import Session

from app.financial_parsing.models import FinancialStatement, LineItem

# Configurable mapping: lowercase substring → canonical label
LABEL_MAP: dict[str, str] = {
    # Income statement
    "total revenue": "Total Revenue",
    "net revenue": "Total Revenue",
    "revenue": "Revenue",
    "sales": "Revenue",
    "net sales": "Revenue",
    "cost of revenue": "Cost of Revenue",
    "cost of goods sold": "Cost of Revenue",
    "cost of sales": "Cost of Revenue",
    "cogs": "Cost of Revenue",
    "gross profit": "Gross Profit",
    "gross margin": "Gross Profit",
    "research and development": "Research & Development",
    "r&d": "Research & Development",
    "selling, general": "Selling, General & Administrative",
    "sg&a": "Selling, General & Administrative",
    "selling general and administrative": "Selling, General & Administrative",
    "operating expense": "Operating Expenses",
    "total operating expense": "Total Operating Expenses",
    "operating income": "Operating Income",
    "income from operations": "Operating Income",
    "interest expense": "Interest Expense",
    "interest income": "Interest Income",
    "other income": "Other Income/Expense",
    "other expense": "Other Income/Expense",
    "income before": "Income Before Tax",
    "pretax income": "Income Before Tax",
    "provision for income tax": "Income Tax Expense",
    "income tax expense": "Income Tax Expense",
    "income tax": "Income Tax Expense",
    "net income": "Net Income",
    "net loss": "Net Income",
    "earnings per share": "Earnings Per Share",
    "basic eps": "Earnings Per Share (Basic)",
    "diluted eps": "Earnings Per Share (Diluted)",
    "depreciation and amortization": "Depreciation & Amortization",
    "depreciation": "Depreciation & Amortization",
    "ebitda": "EBITDA",

    # Balance sheet
    "cash and cash equivalents": "Cash & Cash Equivalents",
    "cash and equivalents": "Cash & Cash Equivalents",
    "short-term investments": "Short-term Investments",
    "marketable securities": "Short-term Investments",
    "accounts receivable": "Accounts Receivable",
    "inventories": "Inventory",
    "inventory": "Inventory",
    "total current assets": "Total Current Assets",
    "property, plant": "Property, Plant & Equipment",
    "property and equipment": "Property, Plant & Equipment",
    "goodwill": "Goodwill",
    "intangible assets": "Intangible Assets",
    "total assets": "Total Assets",
    "accounts payable": "Accounts Payable",
    "accrued": "Accrued Liabilities",
    "short-term debt": "Short-term Debt",
    "current portion of long-term debt": "Short-term Debt",
    "total current liabilities": "Total Current Liabilities",
    "long-term debt": "Long-term Debt",
    "total liabilities": "Total Liabilities",
    "common stock": "Common Stock",
    "retained earnings": "Retained Earnings",
    "accumulated deficit": "Retained Earnings",
    "treasury stock": "Treasury Stock",
    "total stockholders": "Total Stockholders' Equity",
    "total shareholders": "Total Stockholders' Equity",
    "total equity": "Total Stockholders' Equity",
    "total liabilities and stockholders": "Total Liabilities & Equity",
    "total liabilities and shareholders": "Total Liabilities & Equity",
    "total liabilities and equity": "Total Liabilities & Equity",

    # Cash flow
    "operating activities": "Cash from Operating Activities",
    "cash from operations": "Cash from Operating Activities",
    "net cash provided by operating": "Cash from Operating Activities",
    "capital expenditure": "Capital Expenditures",
    "purchases of property": "Capital Expenditures",
    "investing activities": "Cash from Investing Activities",
    "net cash used in investing": "Cash from Investing Activities",
    "financing activities": "Cash from Financing Activities",
    "net cash provided by financing": "Cash from Financing Activities",
    "net cash used in financing": "Cash from Financing Activities",
    "dividends paid": "Dividends Paid",
    "share repurchase": "Share Repurchases",
    "stock-based compensation": "Stock-based Compensation",
    "net change in cash": "Net Change in Cash",
    "net increase": "Net Change in Cash",
    "net decrease": "Net Change in Cash",
    "beginning cash": "Beginning Cash Balance",
    "cash at beginning": "Beginning Cash Balance",
    "ending cash": "Ending Cash Balance",
    "cash at end": "Ending Cash Balance",
}


def normalize_label(raw_label: str) -> str | None:
    """Match a raw label to a canonical label. Returns None if no match."""
    lower = raw_label.lower().strip()
    # Try exact-ish substring matching — longest match first for specificity
    best_match = None
    best_len = 0
    for pattern, canonical in LABEL_MAP.items():
        if pattern in lower and len(pattern) > best_len:
            best_match = canonical
            best_len = len(pattern)
    return best_match


def normalize_statement_labels(db: Session, statement_id: int) -> int:
    """Apply canonical labels to all line items in a statement. Returns count of items normalized."""
    items = db.query(LineItem).filter(LineItem.statement_id == statement_id).all()
    count = 0
    for item in items:
        label = item.edited_label or item.label
        canonical = normalize_label(label)
        if canonical:
            item.canonical_label = canonical
            count += 1
    db.commit()
    return count


def normalize_all_for_investment(db: Session, investment_id: int) -> int:
    """Normalize all line items across all statements mapped to an investment."""
    stmts = db.query(FinancialStatement).filter(
        FinancialStatement.investment_id == investment_id
    ).all()
    total = 0
    for stmt in stmts:
        total += normalize_statement_labels(db, stmt.id)
    return total
