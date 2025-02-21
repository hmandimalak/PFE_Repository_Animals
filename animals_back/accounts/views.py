# views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from .models import Utilisateur,CustomAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests



import logging

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    authentication_classes = []  # No authentication required for registration
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    authentication_classes = []  # No authentication required for login

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import logging
import time
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()  # Use the custom user model

class GoogleLoginView(APIView):
    def post(self, request):
        try:
            logger.info("Received request data: %s", request.data)
            
            # Get the ID token from the request
            id_token_str = request.data.get('id_token')
            access_token = request.data.get('access_token')
            
            logger.info("ID token: %s", id_token_str)
            logger.info("Access token: %s", access_token)
            
            if not id_token_str:
                logger.error("No ID token provided")
                return Response(
                    {'error': 'No ID token provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the ID token with increased clock skew tolerance
            try:
                idinfo = id_token.verify_oauth2_token(
                    id_token_str,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID,
                    clock_skew_in_seconds=30  # Allow up to 30 seconds of clock skew
                )
                
                logger.info("ID info verified: %s", idinfo)
                
                # Log token timestamps for debugging
                logger.info("Token issued at: %s", idinfo.get('iat'))
                logger.info("Token expires at: %s", idinfo.get('exp'))
                logger.info("Current server time: %s", int(time.time()))
                
            except Exception as e:
                logger.error("Token verification failed: %s", str(e))
                return Response(
                    {'error': f'Token verification failed: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract user information
            email = idinfo['email']
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                }
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'email': user.email,
                    'name': f"{user.nom}".strip(),
                    'image': idinfo.get('picture', ''),
                }
            })
        
        except Exception as e:
            logger.error("Unexpected error: %s", str(e))
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['POST'])
def password_reset_request(request):
    authentication_classes = []  # No authentication required for password reset
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User with this email not found"}, status=status.HTTP_400_BAD_REQUEST)

    token = default_token_generator.make_token(user)
    reset_link = f"http://localhost:3000/reset?token={token}&email={email}"
    
    logger.info(f"Sending password reset email to {email} with link {reset_link}")
    
    try:
        send_mail(
            'Password Reset Request',
            f'Click the link to reset your password: {reset_link}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({"error": f"Email sending failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Check your email for the reset link"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def password_reset_confirm(request):
    authentication_classes = []  # No authentication required for password reset confirmation
    token = request.data.get('token')
    email = request.data.get('email')
    password = request.data.get('password')
    confirm_password = request.data.get('confirm_password')
    
    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = get_object_or_404(User, email=email)
    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.save()

    return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    authentication_classes = [CustomAuthentication]
    user = request.user
    return Response({
        "nom": user.nom,
        "prenom": user.prenom,
        "email": user.email,
        "telephone": user.telephone,
        "adresse": user.adresse,
        "role": user.role,
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    authentication_classes = [CustomAuthentication]
    user = request.user
    user.nom = request.data.get('nom', user.nom)
    user.prenom = request.data.get('prenom', user.prenom)
    user.email = request.data.get('email', user.email)
    user.telephone = request.data.get('telephone', user.telephone)
    user.adresse = request.data.get('adresse', user.adresse)
    user.save()

    return Response({
        "message": "Profile updated successfully",
        "nom": user.nom,
        "prenom": user.prenom,
        "email": user.email,
        "telephone": user.telephone,
        "adresse": user.adresse,
    }, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    authentication_classes = [CustomAuthentication]
    user = get_object_or_404(Utilisateur, pk=pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    authentication_classes = [CustomAuthentication]
    users = Utilisateur.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

