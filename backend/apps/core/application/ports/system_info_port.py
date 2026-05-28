from abc import ABC, abstractmethod
from apps.core.domain.system_info import SystemInfo


class SystemInfoPort(ABC):
    @abstractmethod
    def get_system_info(self) -> SystemInfo:
        pass
