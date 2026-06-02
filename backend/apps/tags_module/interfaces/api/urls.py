from django.urls import path
from . import views

urlpatterns = [
    path("",                               views.list_tags,     name="tag-list"),
    path("create/",                        views.create_tag,    name="tag-create"),
    path("colors/",                        views.tag_colors,    name="tag-colors"),
    path("<int:tag_id>/delete/",           views.delete_tag,    name="tag-delete"),
    path("<int:tag_id>/update/",           views.update_tag,    name="tag-update"),
    path("bulk/set/",                      views.bulk_set_tags, name="tag-bulk-set"),
    path("file/<int:file_id>/",            views.get_file_tags, name="file-tags-get"),
    path("file/<int:file_id>/set/",        views.set_file_tags, name="file-tags-set"),
]
