from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.auth_module.application.use_cases.register_user import RegisterUserUseCase
from apps.auth_module.application.use_cases.login_user import LoginUserUseCase
from apps.auth_module.application.use_cases.get_current_user import GetCurrentUserUseCase
from apps.auth_module.infrastructure.repositories.django_auth_repository import DjangoAuthRepository
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


def _repo():
    return DjangoAuthRepository()


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = RegisterUserUseCase(_repo()).execute(**serializer.validated_data)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        tokens = LoginUserUseCase(_repo()).execute(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        "access": tokens.access,
        "refresh": tokens.refresh,
        "user": UserSerializer(tokens.user).data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    try:
        user = GetCurrentUserUseCase(_repo()).execute(request.user.id)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    return Response(UserSerializer(user).data)
