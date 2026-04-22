from pydantic import BaseModel

class CreateLoteRequest(BaseModel):
    vendedor_id: int
    titulo: str
    categoria: str
    peso: str
    local: str
    descricao: str

class LoteResponse(BaseModel):
    id: int
    vendedor_id: int
    titulo: str
    categoria: str
    peso: str
    local: str
    descricao: str

    class Config:
        from_attributes = True