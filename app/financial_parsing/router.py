import os

from fastapi import APIRouter, BackgroundTasks, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.financial_parsing import service
from app.financial_parsing.schemas import (
    DocumentStatementsResponse,
    FinancialStatementResponse,
    ParseJobResponse,
)

router = APIRouter(
    prefix="/investments/{investment_id}/documents/{document_id}/financials",
    tags=["Financial Parsing"],
)


@router.post("/parse", response_model=ParseJobResponse, status_code=status.HTTP_202_ACCEPTED)
def trigger_parsing(
    investment_id: int,
    document_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    job, chunks = service.parse_document_financials(db, investment_id, document_id)
    pdf_path = db.query(service.Document).filter(
        service.Document.id == document_id
    ).first().file_path
    background_tasks.add_task(service.run_parsing, job.id, pdf_path, chunks)
    return job


@router.get("/status", response_model=ParseJobResponse | None)
def get_parse_status(
    investment_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    job = service.get_parse_job(db, document_id)
    return job


@router.get("/", response_model=DocumentStatementsResponse)
def get_document_financials(
    investment_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    job = service.get_parse_job(db, document_id)
    statements = service.get_statements_for_document(db, document_id)
    return DocumentStatementsResponse(parse_job=job, statements=statements)


@router.get("/statements/{statement_id}", response_model=FinancialStatementResponse)
def get_statement(
    investment_id: int,
    document_id: int,
    statement_id: int,
    db: Session = Depends(get_db),
):
    return service.get_statement(db, statement_id)


@router.get("/export")
def export_excel(
    investment_id: int,
    document_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    tmp_path = service.export_to_excel(db, document_id)
    background_tasks.add_task(os.unlink, tmp_path)
    return FileResponse(
        path=tmp_path,
        filename="financial_statements.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_financials(
    investment_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    service.delete_financials(db, document_id)
