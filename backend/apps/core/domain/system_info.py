from dataclasses import dataclass


@dataclass
class SystemInfo:
    name: str
    version: str
    status: str
    environment: str
