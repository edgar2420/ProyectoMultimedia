from abc import ABC, abstractmethod
from apps.auth_module.domain.user import User, AuthTokens


class AuthPort(ABC):
    @abstractmethod
    def register(self, username: str, email: str, password: str,
                 first_name: str, last_name: str) -> User:
        pass

    @abstractmethod
    def authenticate(self, username: str, password: str) -> AuthTokens:
        pass

    @abstractmethod
    def get_user_by_id(self, user_id: int) -> User:
        pass

    @abstractmethod
    def username_exists(self, username: str) -> bool:
        pass

    @abstractmethod
    def email_exists(self, email: str) -> bool:
        pass
