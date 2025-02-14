# animals/urls.py
from django.urls import path
from .views import AnimalListCreateView, AnimalDetailView, DemandeGardeListCreateView,AnimalAdminDefinitiveListView,AnimalDetailView,DemandeAdoptionAPIView
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    # Animal Routes
    path('animaux/', AnimalListCreateView.as_view(), name='animal-list-create'),  # POST to create animals and related garde requests
    path('animaux/<int:pk>/', AnimalDetailView.as_view(), name='animal-detail'),  # GET, PUT, DELETE for animal details

    # Demande Garde Routes
    path('demandes-garde/', DemandeGardeListCreateView.as_view(), name='demande-garde-list-create'),  # GET and POST for garde requests

    # Demande Adoption Routes
    path('demandes-adoption/', DemandeAdoptionAPIView.as_view(  ), name='demande-adoption-list-create'),  # GET and POST for adoption requests

    #page de consult d'animaux
    path('definitive/', AnimalAdminDefinitiveListView.as_view(), name='admin-animal-list'),  # GET to list all animals
    path('<int:pk>/', AnimalDetailView.as_view(), name='admin-animal-detail'),  # GET to view animal details

]
# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)