from domain.lote import Lote
from domain.ports.lote_repository import LoteRepository

class CreateLoteUseCase:
    def __init__(self, repository: LoteRepository):
        self.repository = repository

    def execute(self, vendedor_id: int, titulo: str, categoria: str, peso: str, local: str, descricao: str) -> Lote:
        # Aqui poderiam entrar regras, ex: validar se o titulo não está vazio
        lote = Lote(id=None, vendedor_id=vendedor_id, titulo=titulo, categoria=categoria, peso=peso, local=local, descricao=descricao)
        return self.repository.save(lote)