from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
import jwt

#superuser
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

class Utilisateur(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20)
    role = models.CharField(
        max_length=20,
        choices=[("Proprietaire", "Proprietaire"), ("Responsable", "Responsable"), ("Promeneur", "Promeneur")],
    )
    adresse = models.CharField(max_length=255)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nom", "prenom", "telephone", "role", "adresse"]

    def __str__(self):
        return self.email

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            # Split 'Bearer <token>'
            auth_type, token = auth_header.split(' ')
            if auth_type.lower() != 'bearer':
                return None

            # First try to validate as a regular JWT token
            try:
                # Decode JWT token
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=['HS256']
                )
                user = Utilisateur.objects.get(id=payload['user_id'])
                return (user, None)
            except (jwt.InvalidTokenError, Utilisateur.DoesNotExist):
                # If JWT validation fails, try Google token
                try:
                    idinfo = id_token.verify_oauth2_token(
                        token, 
                        requests.Request(), 
                        settings.GOOGLE_CLIENT_ID
                    )
                    
                    if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                        raise ValueError('Wrong issuer.')
                    
                    # Get or create user based on Google info
                    email = idinfo['email']
                    user, created = Utilisateur.objects.get_or_create(
                        email=email,
                        defaults={
                            'nom': idinfo.get('family_name', ''),
                            'prenom': idinfo.get('given_name', ''),
                            'telephone': '',  # You might want to set default values
                            'role': 'Promeneur',  # Set a default role
                            'adresse': ''  # You might want to set default values
                        }
                    )
                    return (user, None)
                except ValueError:
                    raise exceptions.AuthenticationFailed('Invalid Google token')
        except ValueError:
            raise exceptions.AuthenticationFailed('Invalid token format')

    def authenticate_header(self, request):
        return 'Bearer'