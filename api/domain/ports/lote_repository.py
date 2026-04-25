from abc import ABC, abstractmethod
from typing import List
from domain.lote import Lote

class LoteRepository(ABC):
    @abstractmethod
    def save(self,lote: Lote) -> Lote:
        pass
    
    @abstractmethod
    def list_all(self) -> List[Lote]:
        pass