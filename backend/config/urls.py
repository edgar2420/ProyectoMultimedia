from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.core.interfaces.api.urls")),
    path("api/v1/auth/", include("apps.auth_module.interfaces.api.urls")),
    path("api/v1/media/", include("apps.media_module.interfaces.api.urls")),
    path("api/v1/tags/", include("apps.tags_module.interfaces.api.urls")),
    path("api/v1/search/", include("apps.search_module.interfaces.api.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
