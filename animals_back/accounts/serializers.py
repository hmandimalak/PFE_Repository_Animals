from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


#Register Serializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nom', 'prenom', 'email', 'telephone', 'role', 'adresse', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            telephone=validated_data['telephone'],
            role=validated_data['role'],
            adresse=validated_data['adresse']
        )
        return user


#Login Serializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the token
        token['email'] = user.email
        token['nom'] = user.nom
        token['prenom'] = user.prenom
        token['role'] = user.role
        return token

 
 