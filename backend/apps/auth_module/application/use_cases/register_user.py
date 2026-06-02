from apps.auth_module.application.ports.auth_port import AuthPort
from apps.auth_module.domain.user import User


class RegisterUserUseCase:
    def __init__(self, port: AuthPort):
        self._port = port

    def execute(self, username: str, email: str, password: str,
                first_name: str = "", last_name: str = "") -> User:
        if self._port.username_exists(username):
            raise ValueError("El nombre de usuario ya está en uso.")
        if self._port.email_exists(email):
            raise ValueError("El correo electrónico ya está registrado.")
        if len(password) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres.")
        return self._port.register(username, email, password, first_name, last_name)
