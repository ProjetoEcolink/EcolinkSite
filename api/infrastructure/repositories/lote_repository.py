from sqlalchemy.orm import Session
from typing import List
from domain.lote import Lote
from domain.ports.lote_repository import LoteRepository
from infrastructure.models.lote import LoteModel

class SQLAlchemyLoteRepository(LoteRepository):
    def __init__(self, db: Session):
        self.db = db

    def save(self, lote: Lote) -> Lote:
        lote_model = LoteModel(
            vendedor_id=lote.vendedor_id,
            titulo=lote.titulo,
            categoria=lote.categoria,
            peso=lote.peso,
            local=lote.local,
            descricao=lote.descricao
        )
        self.db.add(lote_model)
        self.db.commit()
        self.db.refresh(lote_model)
        
        return Lote(
            id=lote_model.id, vendedor_id=lote_model.vendedor_id, titulo=lote_model.titulo,
            categoria=lote_model.categoria, peso=lote_model.peso, local=lote_model.local, descricao=lote_model.descricao
        )

    def list_all(self) -> List[Lote]:
        model_lotes = self.db.query(LoteModel).all()
        return [
            Lote(id=m.id, vendedor_id=m.vendedor_id, titulo=m.titulo, categoria=m.categoria, peso=m.peso, local=m.local, descricao=m.descricao) 
            for m in model_lotes
        ]