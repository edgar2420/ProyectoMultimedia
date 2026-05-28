from apps.core.application.ports.system_info_port import SystemInfoPort
from apps.core.domain.system_info import SystemInfo


class GetSystemInfoUseCase:
    def __init__(self, port: SystemInfoPort):
        self._port = port

    def execute(self) -> SystemInfo:
        return self._port.get_system_info()
