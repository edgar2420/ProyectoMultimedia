from apps.auth_module.application.ports.auth_port import AuthPort
from apps.auth_module.domain.user import User


class GetCurrentUserUseCase:
    def __init__(self, port: AuthPort):
        self._port = port

    def execute(self, user_id: int) -> User:
        return self._port.get_user_by_id(user_id)
