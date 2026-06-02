from django.apps import AppConfig


class TagsModuleConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.tags_module"
    label = "tags_module"

    def ready(self):
        # Importar modelos para registrarlos
        import apps.tags_module.infrastructure.models  # noqa
