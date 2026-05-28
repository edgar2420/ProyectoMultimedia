from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core.application.use_cases.get_system_info import GetSystemInfoUseCase
from apps.core.infrastructure.repositories.system_info_repository import DjangoSystemInfoRepository


@api_view(["GET"])
def health_check(request):
    use_case = GetSystemInfoUseCase(DjangoSystemInfoRepository())
    info = use_case.execute()
    return Response({
        "name": info.name,
        "version": info.version,
        "status": info.status,
        "environment": info.environment,
    })
