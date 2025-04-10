from rest_framework import serializers
from .models import CustomUser, Event, Registration
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = CustomUser(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = Event
        fields = '__all__'


from rest_framework import serializers
from .models import Registration

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['id', 'event']  

    def create(self, validated_data):
        validated_data.pop('user', None)
        user = self.context['request'].user
        return Registration.objects.create(user=user, **validated_data)

