from apps.auth_module.application.ports.auth_port import AuthPort
from apps.auth_module.domain.user import AuthTokens


class LoginUserUseCase:
    def __init__(self, port: AuthPort):
        self._port = port

    def execute(self, username: str, password: str) -> AuthTokens:
        if not username or not password:
            raise ValueError("Usuario y contraseña son requeridos.")
        return self._port.authenticate(username, password)
