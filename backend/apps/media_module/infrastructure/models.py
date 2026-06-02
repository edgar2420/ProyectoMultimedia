from django.db import models
from django.contrib.auth.models import User


class FolderModel(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="folders")
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True,
        related_name="children"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "media_module"
        ordering = ["name"]
        unique_together = [("name", "owner", "parent")]

    def __str__(self):
        return self.name


class MediaFileModel(models.Model):
    FILE_TYPE_CHOICES = [
        ("image", "Image"), ("video", "Video"), ("audio", "Audio"),
        ("document", "Document"), ("other", "Other"),
    ]

    name = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=500)
    thumbnail_path = models.CharField(max_length=500, blank=True, default="")
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    mime_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    image_metadata = models.JSONField(null=True, blank=True, default=None)
    video_metadata = models.JSONField(null=True, blank=True, default=None)
    audio_metadata = models.JSONField(null=True, blank=True, default=None)
    pdf_metadata = models.JSONField(null=True, blank=True, default=None)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="media_files")
    folder = models.ForeignKey(
        FolderModel, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="files"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "media_module"
        ordering = ["-created_at"]

    def __str__(self):
        return self.original_name
