from django.contrib.auth import authenticate
from django.contrib.auth.models import User as DjangoUser
from rest_framework_simplejwt.tokens import RefreshToken

from apps.auth_module.application.ports.auth_port import AuthPort
from apps.auth_module.domain.user import User, AuthTokens


def _to_domain(django_user: DjangoUser) -> User:
    return User(
        id=django_user.id,
        username=django_user.username,
        email=django_user.email,
        first_name=django_user.first_name,
        last_name=django_user.last_name,
        is_active=django_user.is_active,
        date_joined=django_user.date_joined,
    )


class DjangoAuthRepository(AuthPort):
    def register(self, username: str, email: str, password: str,
                 first_name: str, last_name: str) -> User:
        django_user = DjangoUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        return _to_domain(django_user)

    def authenticate(self, username: str, password: str) -> AuthTokens:
        django_user = authenticate(username=username, password=password)
        if django_user is None:
            raise ValueError("Credenciales incorrectas.")
        refresh = RefreshToken.for_user(django_user)
        return AuthTokens(
            access=str(refresh.access_token),
            refresh=str(refresh),
            user=_to_domain(django_user),
        )

    def get_user_by_id(self, user_id: int) -> User:
        try:
            django_user = DjangoUser.objects.get(id=user_id)
        except DjangoUser.DoesNotExist:
            raise ValueError("Usuario no encontrado.")
        return _to_domain(django_user)

    def username_exists(self, username: str) -> bool:
        return DjangoUser.objects.filter(username=username).exists()

    def email_exists(self, email: str) -> bool:
        return DjangoUser.objects.filter(email=email).exists()
