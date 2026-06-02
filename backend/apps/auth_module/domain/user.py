from dataclasses import dataclass
from datetime import datetime


@dataclass
class User:
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    is_active: bool
    date_joined: datetime

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.username


@dataclass
class AuthTokens:
    access: str
    refresh: str
    user: User
