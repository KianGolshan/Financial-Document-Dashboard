import re

from sqlalchemy.orm import Session

from app.documents.models import Document


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


def search_documents(db: Session, query: str) -> list[dict]:
    if not query.strip():
        return []
    docs = (
        db.query(Document)
        .filter(Document.text_content.ilike(f"%{query}%"))
        .order_by(Document.created_at.desc())
        .all()
    )
    results = []
    for doc in docs:
        snippets = extract_snippets(doc.text_content or "", query)
        download_url = f"/api/v1/investments/{doc.investment_id}/documents/{doc.id}/download"
        results.append(
            {"document": doc, "snippets": snippets, "download_url": download_url}
        )
    return results
