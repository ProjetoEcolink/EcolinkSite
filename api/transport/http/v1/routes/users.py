from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import bcrypt
from sqlalchemy.orm import Session
from transport.http.v1.schemas.user import CreateUserRequest, UserResponse
from application.users.create_user_use_case import CreateUserUseCase
from application.users.delete_user_use_case import DeleteUserUseCase
from infrastructure.repositories.user_repository import SQLAlchemyUserRepository
from infrastructure.database import get_db

router = APIRouter()

# --- NOVO MOLDE (SCHEMA) APENAS PARA O LOGIN ---
class LoginRequest(BaseModel):
    email: str
    password: str
# -----------------------------------------------

@router.post("/users", response_model=UserResponse)
def create_user(request: CreateUserRequest, db: Session = Depends(get_db)):
    repository = SQLAlchemyUserRepository(db)
    use_case = CreateUserUseCase(repository)
    try:
        user = use_case.execute(request.name, request.email, request.password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/users/{user_id}", response_model=UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    repository = SQLAlchemyUserRepository(db)
    use_case = DeleteUserUseCase(repository)
    try:
        user = use_case.execute(user_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# =======================================================
#               NOVA ROTA DE LOGIN
# =======================================================
@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    repository = SQLAlchemyUserRepository(db)
    
    user = repository.find_by_email(request.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
        
    # 3. Transforma as senhas em "bytes" e manda o bcrypt comparar as duas
    senha_digitada = request.password.encode('utf-8')
    senha_do_banco = user.password_hash.encode('utf-8')
    
    if not bcrypt.checkpw(senha_digitada, senha_do_banco):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
        
    return {
        "message": "Login aprovado",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }