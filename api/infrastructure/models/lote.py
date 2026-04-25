from sqlalchemy import Column, Integer, String, ForeignKey, Text
from infrastructure.database import Base
class LoteModel(Base):
    __tablename__ = "lotes"

    id = Column(Integer, primary_key=True, index=True)
    vendedor_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Liga com a tabela de usuários
    titulo = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    peso = Column(String, nullable=False)
    local = Column(String, nullable=False)
    descricao = Column(Text, nullable=False)