from rest_framework import serializers


class FolderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    owner_id = serializers.IntegerField()
    parent_id = serializers.IntegerField(allow_null=True)
    children_count = serializers.IntegerField()
    files_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()


class MediaFileSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    original_name = serializers.CharField()
    file_url = serializers.CharField()
    file_type = serializers.CharField()
    mime_type = serializers.CharField()
    size = serializers.IntegerField()
    owner_id = serializers.IntegerField()
    folder_id = serializers.IntegerField(allow_null=True)
    thumbnail_url = serializers.CharField(allow_null=True)
    image_metadata = serializers.DictField(allow_null=True)
    video_metadata = serializers.DictField(allow_null=True)
    audio_metadata = serializers.DictField(allow_null=True)
    pdf_metadata = serializers.DictField(allow_null=True)
    tags = serializers.ListField(child=serializers.DictField(), default=list)
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
