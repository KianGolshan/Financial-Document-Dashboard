from pydantic import BaseModel

from app.documents.schemas import DocumentResponse


class SearchResultItem(BaseModel):
    document: DocumentResponse
    snippets: list[str]
    download_url: str


class SearchResponse(BaseModel):
    results: list[SearchResultItem]
    total: int
    query: str
