from rest_framework import serializers


class TagSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    color = serializers.CharField()
    owner_id = serializers.IntegerField()
    file_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()
