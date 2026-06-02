# Re-export models so Django's migration framework discovers them
from apps.tags_module.infrastructure.models import TagModel  # noqa

__all__ = ["TagModel"]
