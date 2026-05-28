import django
from apps.core.application.ports.system_info_port import SystemInfoPort
from apps.core.domain.system_info import SystemInfo


class DjangoSystemInfoRepository(SystemInfoPort):
    def get_system_info(self) -> SystemInfo:
        return SystemInfo(
            name="Multimedia Manager API",
            version="1.0.0",
            status="online",
            environment="development",
        )
