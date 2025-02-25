# animals/urls.py
from django.urls import path
from .views import AnimalListCreateView, AnimalDetailView, DemandeGardeListCreateView,AnimalAdminDefinitiveListView,AnimalDetailView,DemandeAdoptionAPIView,NotificationView,NotificationMarkReadView, UserAcceptedAdoptionAnimalsView, UserAcceptedDefinitiveAnimalsView, UserAcceptedTemporaryAnimalsView,search_animals,get_animal_by_id

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

    path('notifications/', NotificationView.as_view(), name='notifications-list'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),

    path('search/', search_animals, name='search_animals'),
    path('search/<int:pk>/', get_animal_by_id, name='search_animals'),

    path('mes-animaux-temporaire/', UserAcceptedTemporaryAnimalsView.as_view(), name='mes-animaux-temporaire'),
    path('mes-animaux-definitive/', UserAcceptedDefinitiveAnimalsView.as_view(), name='mes-animaux-definitive'),
    path('mes-adoptions/', UserAcceptedAdoptionAnimalsView.as_view(), name='mes-adoptions'),
    
    



]
# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)