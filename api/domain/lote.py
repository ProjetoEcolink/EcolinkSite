from dataclasses import dataclass
from typing import Optional

@dataclass
class Lote:
    id: Optional[int] # Para sabermos quem é o dono do anúncio
    vendedor_id: int
    titulo: str
    categoria: str
    peso: str
    local: str
    descricao: str