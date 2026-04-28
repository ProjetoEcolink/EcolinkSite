from domain.user import User
from domain.ports.user_repository import UserRepository
from infrastructure.security import Security

class LoginUseCase:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def execute(self, email: str, password: str) -> User:
        user = self.repository.find_by_email(email)
        if not user:
            raise ValueError("Invalid email or password")
        
        if not Security.verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")
        
        return user