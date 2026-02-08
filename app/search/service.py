import re

from sqlalchemy.orm import Session, joinedload

from app.documents.models import Document
from app.investments.models import Investment
from app.securities.models import Security


def extract_snippets(
    text: str, query: str, context_chars: int = 100, max_snippets: int = 3
) -> list[str]:
    if not text or not query:
        return []
    pattern = re.compile(re.escape(query), re.IGNORECASE)
    matches = list(pattern.finditer(text))
    snippets: list[str] = []
    for match in matches[:max_snippets]:
        start = max(0, match.start() - context_chars)
        end = min(len(text), match.end() + context_chars)
        snippet = text[start:end]
        if start > 0:
            snippet = "..." + snippet
        if end < len(text):
            snippet = snippet + "..."
        # Highlight matches with <mark> tags
        snippet = pattern.sub(lambda m: f"<mark>{m.group()}</mark>", snippet)
        snippets.append(snippet)
    return snippets


def search_documents(
    db: Session,
    query: str,
    investment_id: int | None = None,
    security_id: int | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict]:
    if not query.strip():
        return []

    q = (
        db.query(Document)
        .join(Investment, Document.investment_id == Investment.id)
        .outerjoin(Security, Document.security_id == Security.id)
        .filter(Document.text_content.ilike(f"%{query}%"))
    )

    if investment_id is not None:
        q = q.filter(Document.investment_id == investment_id)
    if security_id is not None:
        q = q.filter(Document.security_id == security_id)
    if date_from:
        q = q.filter(Document.document_date >= date_from)
    if date_to:
        q = q.filter(Document.document_date <= date_to)

    docs = q.order_by(Document.created_at.desc()).all()

    results = []
    for doc in docs:
        snippets = extract_snippets(doc.text_content or "", query)
        download_url = f"/api/v1/investments/{doc.investment_id}/documents/{doc.id}/download"
        # Get investment name and round from relationships
        inv_name = doc.investment.investment_name if doc.investment else None
        inv_round = doc.security.investment_round if doc.security else None
        results.append({
            "document": doc,
            "snippets": snippets,
            "download_url": download_url,
            "investment_name": inv_name,
            "investment_round": inv_round,
        })
    return results
