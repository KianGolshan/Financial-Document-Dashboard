from pathlib import Path

from fastapi import APIRouter, Depends, Form, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.documents import service
from app.documents.schemas import DocumentListResponse, DocumentResponse
from app.exceptions import not_found

router = APIRouter(
    prefix="/investments/{investment_id}/documents",
    tags=["Documents"],
)


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    investment_id: int,
    file: UploadFile,
    document_name: str = Form(...),
    document_date: str | None = Form(None),
    db: Session = Depends(get_db),
):
    return await service.upload_document(
        db, investment_id, file, document_name, document_date
    )


@router.post("/bulk", response_model=list[DocumentResponse], status_code=status.HTTP_201_CREATED)
async def bulk_upload_documents(
    investment_id: int,
    files: list[UploadFile],
    document_name: str = Form(...),
    document_date: str | None = Form(None),
    db: Session = Depends(get_db),
):
    return await service.bulk_upload_documents(
        db, investment_id, files, document_name, document_date
    )


@router.get("/", response_model=DocumentListResponse)
def list_documents(investment_id: int, db: Session = Depends(get_db)):
    docs, total = service.list_documents(db, investment_id)
    return DocumentListResponse(items=docs, total=total)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    investment_id: int, document_id: int, db: Session = Depends(get_db)
):
    return service.get_document(db, investment_id, document_id)


@router.get("/{document_id}/download")
def download_document(
    investment_id: int, document_id: int, db: Session = Depends(get_db)
):
    doc = service.get_document(db, investment_id, document_id)
    path = Path(doc.file_path)
    if not path.exists():
        raise not_found("File not found on disk")
    return FileResponse(
        path=path,
        filename=doc.original_filename,
        media_type="application/octet-stream",
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    investment_id: int, document_id: int, db: Session = Depends(get_db)
):
    service.delete_document(db, investment_id, document_id)
