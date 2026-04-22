from typing import List
from domain.lote import Lote
from domain.ports.lote_repository import LoteRepository

class ListLotesUseCase:
    def __init__(self, repository: LoteRepository):
        self.repository = repository

    def execute(self) -> List[Lote]:
        return self.repository.list_all()