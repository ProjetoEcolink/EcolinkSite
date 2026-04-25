from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from infrastructure.database import get_db
from infrastructure.repositories.lote_repository import SQLAlchemyLoteRepository
from application.lotes.create_lote_use_case import CreateLoteUseCase
from application.lotes.list_lotes_use_case import ListLotesUseCase
from transport.http.v1.schemas.lote import CreateLoteRequest, LoteResponse

router = APIRouter()

@router.post("/lotes", response_model=LoteResponse)
def create_lote(request: CreateLoteRequest, db: Session = Depends(get_db)):
    repo = SQLAlchemyLoteRepository(db)
    use_case = CreateLoteUseCase(repo)
    return use_case.execute(
        request.vendedor_id, request.titulo, request.categoria, 
        request.peso, request.local, request.descricao
    )

@router.get("/lotes", response_model=List[LoteResponse])
def list_lotes(db: Session = Depends(get_db)):
    repo = SQLAlchemyLoteRepository(db)
    use_case = ListLotesUseCase(repo)
    return use_case.execute()