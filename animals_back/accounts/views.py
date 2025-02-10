from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Utilisateur

from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from social_django.utils import psa


class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer




import logging
logger = logging.getLogger(__name__)


#reset password
User = get_user_model()  # This ensures you use the correct user 
@api_view(['POST'])
def password_reset_request(request):
    email = request.data.get('email')
    
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User with this email not found"}, status=status.HTTP_400_BAD_REQUEST)

    token = default_token_generator.make_token(user)
    reset_link = f"http://localhost:3000/reset?token={token}&email={email}"

    # Log the email details
    logger.info(f"Sending password reset email to {email} with link {reset_link}")

    try:
        send_mail(
            'Password Reset Request',
            f'Click the link to reset your password: {reset_link}',
            settings.EMAIL_HOST_USER,  # Your Gmail as the sender
            [email],  # Recipient's email
            fail_silently=False,
        )
    except Exception as e:
        return Response({"error": f"Email sending failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Check your email for the reset link"}, status=status.HTTP_200_OK)

#newpassword
@api_view(['POST'])
def password_reset_confirm(request):
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

#user-informations
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    return Response({
        "nom": user.nom,
        "prenom": user.prenom,
        "email": user.email,
        "telephone": user.telephone,
        "adresse": user.adresse,
        "role": user.role,
    })


#edit-profile
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
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


#admin
#view user detail
@api_view(['GET'])
def user_detail(request, pk):
    user = get_object_or_404(Utilisateur, pk=pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)

#view all users
@api_view(['GET'])
def user_list(request):
    users = Utilisateur.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)



class GoogleLogin(APIView):
    @psa('social:complete')
    def post(self, request, *args, **kwargs):
        # Check if the token is valid
        user = request.user
        if user.is_authenticated:
            return Response({"message": "User logged in successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Authentication failed"}, status=status.HTTP_400_BAD_REQUEST)
class CustomGoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:8000/api/auth/google/callback/"

    def get_response_data(self, data):
        # Customize the response if needed (e.g., return user details along with token)
        return Response({
            'access': data.get('access_token'),
            'refresh': data.get('refresh_token'),
            'user': {
                'id': data.get('user').id,
                'email': data.get('user').email
            }
        }, status=status.HTTP_200_OK)