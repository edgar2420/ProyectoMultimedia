from django.urls import path
from . import views, folder_views

urlpatterns = [
    # Archivos
    path("stats/", views.stats, name="media-stats"),
    path("files/", views.list_files, name="media-list"),
    path("files/search/", views.search_files, name="media-search"),
    path("files/upload/", views.upload_file, name="media-upload"),
    path("files/<int:file_id>/", views.get_file, name="media-detail"),
    path("files/<int:file_id>/metadata/", views.get_file_metadata, name="media-metadata"),
    path("files/<int:file_id>/move/", views.move_file, name="media-move"),
    path("files/<int:file_id>/delete/", views.delete_file, name="media-delete"),

    # Carpetas
    path("folders/", folder_views.list_folders, name="folder-list"),
    path("folders/tree/", folder_views.folder_tree, name="folder-tree"),
    path("folders/create/", folder_views.create_folder, name="folder-create"),
    path("folders/<int:folder_id>/", folder_views.folder_detail, name="folder-detail"),
    path("folders/<int:folder_id>/breadcrumb/", folder_views.folder_breadcrumb, name="folder-breadcrumb"),
    path("folders/<int:folder_id>/rename/", folder_views.rename_folder, name="folder-rename"),
    path("folders/<int:folder_id>/delete/", folder_views.delete_folder, name="folder-delete"),
]
