from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("username", "email", "password")
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists"
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)

        return {
            "user": {
                "id": instance.id,
                "username": instance.username,
                "email": instance.email,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data["username"],
            password=data["password"]
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid credentials"
            )

        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }