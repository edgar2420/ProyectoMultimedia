from django.db import models
from django.contrib.auth.models import User
from apps.media_module.infrastructure.models import MediaFileModel


class TagModel(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20, default="#5ccb5f")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tags")
    files = models.ManyToManyField(
        MediaFileModel,
        blank=True,
        related_name="tags",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "tags_module"
        ordering = ["name"]
        unique_together = [("name", "owner")]

    def __str__(self):
        return self.name
