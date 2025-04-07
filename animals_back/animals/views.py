from datetime import date, timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Animal, DemandeEvenementMarche, DemandeGarde, DemandeAdoption, EvenementMarcheChien,Notification
from .serializers import AnimalSerializer, DemandeEvenementMarcheSerializer, DemandeGardeSerializer, DemandeAdoptionSerializer, EvenementMarcheChienSerializer,NotificationSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets
from django.db.models import Q
from django.http import JsonResponse
from rest_framework import generics
    



class AnimalListCreateView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # First, create the animal
        animal_serializer = AnimalSerializer(data=request.data)
        if animal_serializer.is_valid():
            print(request)
            animal = animal_serializer.save()

            # Now, create the corresponding "Demande de Garde" (Guard Request)
            demande_garde_data = {
                'animal': animal.id,
                'utilisateur': request.user.id,
                'statut': 'En attente',
                'message': request.data.get('message', ''),
                'type_garde': animal.type_garde,
                'image': animal.image  # Copy the image from Animal
            }


            #Pass the request context to the serializer
            demande_garde_serializer = DemandeGardeSerializer(data=demande_garde_data, context={'request': request})
            if demande_garde_serializer.is_valid():
                # Save the "Demande de Garde" to the database
                demande_garde_serializer.save()

                # Return both the animal and the guard request details
                return Response({
                    'animal': animal_serializer.data,
                    'demande_garde': demande_garde_serializer.data
                }, status=status.HTTP_201_CREATED)

            # If there are errors in the guard request creation, return them
            return Response(demande_garde_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # If there are errors in the animal creation, return them
        return Response(animal_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnimalDetailView(APIView):
    def get(self, request, pk):
        animal = get_object_or_404(Animal, pk=pk)
        serializer = AnimalSerializer(animal)
        return Response(serializer.data)

    def put(self, request, pk):
        animal = get_object_or_404(Animal, pk=pk)
        serializer = AnimalSerializer(animal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        animal = get_object_or_404(Animal, pk=pk)
        animal.delete()
        return Response({"message": "animal deleted"}, status=status.HTTP_204_NO_CONTENT)


# Gestion des demandes de garde
class DemandeGardeListCreateView(APIView):
    def get(self, request):
        demandes = DemandeGarde.objects.all()
        serializer = DemandeGardeSerializer(demandes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DemandeGardeSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user to the request
            serializer.save(utilisateur=request.user)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



# Gestion des demandes d'adoption
class DemandeAdoptionListCreateView(APIView):
    def get(self, request):
        demandes = DemandeAdoption.objects.all()
        serializer = DemandeAdoptionSerializer(demandes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DemandeAdoptionSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user to the request
            serializer.save(utilisateur=request.user)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



class DemandeAdoptionDetailView(APIView):
    def get(self, request, pk):
        demande = get_object_or_404(DemandeAdoption, pk=pk)
        serializer = DemandeAdoptionSerializer(demande)
        return Response(serializer.data)

    def put(self, request, pk):
        demande = get_object_or_404(DemandeAdoption, pk=pk)
        serializer = DemandeAdoptionSerializer(demande, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        demande = get_object_or_404(DemandeAdoption, pk=pk)
        demande.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class AnimalAdminDefinitiveListView(APIView):
    parser_classes = [MultiPartParser, FormParser]  # Enable file parsing

    def get(self, request):
        # List all animals in the system
        animals = Animal.objects.filter(type_garde='Définitive',disponible_pour_adoption=True)  # Use the exact value from choices
        serializer = AnimalSerializer(animals, many=True)
        #print("test",serializer.data)  
        return Response(serializer.data)

class AnimalDetailView(APIView):
    def get(self, request, pk):
        try:
            animal = Animal.objects.get(pk=pk)
            print("test", animal.image)
        except Animal.DoesNotExist:
            return Response({"error": "Animal not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AnimalSerializer(animal)
        return Response(serializer.data)

class DemandeAdoptionAPIView(APIView):
    """API view for users to create and view their adoption requests"""
    
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Automatically create an adoption request for the logged-in user"""
        # Create a new adoption request and set the logged-in user as the requester
        serializer = DemandeAdoptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(utilisateur=request.user)  # Associate the logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Animal, DemandeGarde, DemandeAdoption,Notification
from .serializers import AnimalSerializer, DemandeGardeSerializer, DemandeAdoptionSerializer,NotificationSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets






class AnimalDetailView(APIView):
    def get(self, request, pk):
        animal = get_object_or_404(Animal, pk=pk)
        serializer = AnimalSerializer(animal)
        return Response(serializer.data)

    def put(self, request, pk):
        animal = get_object_or_404(Animal, pk=pk)
        serializer = AnimalSerializer(animal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        animal = get_object_or_404(Animal, pk=pk)
        animal.delete()
        return Response({"message": "animal deleted"}, status=status.HTTP_204_NO_CONTENT)


# Gestion des demandes de garde
class DemandeGardeListCreateView(APIView):
    def get(self, request):
        demandes = DemandeGarde.objects.all()
        serializer = DemandeGardeSerializer(demandes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DemandeGardeSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user to the request
            serializer.save(utilisateur=request.user)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



# Gestion des demandes d'adoption
class DemandeAdoptionListCreateView(APIView):
    def get(self, request):
        demandes = DemandeAdoption.objects.all()
        serializer = DemandeAdoptionSerializer(demandes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DemandeAdoptionSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user to the request
            serializer.save(utilisateur=request.user)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



class DemandeAdoptionDetailView(APIView):
    def get(self, request, pk):
        demande = get_object_or_404(DemandeAdoption, pk=pk)
        serializer = DemandeAdoptionSerializer(demande)
        return Response(serializer.data)

    def put(self, request, pk):
        demande = get_object_or_404(DemandeAdoption, pk=pk)
        serializer = DemandeAdoptionSerializer(demande, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        demande = get_object_or_404(DemandeAdoption, pk=pk)
        demande.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class AnimalAdminDefinitiveListView(APIView):
    parser_classes = [MultiPartParser, FormParser]  # Enable file parsing

    def get(self, request):
        # List all animals in the system
        animals = Animal.objects.filter(type_garde='Définitive',disponible_pour_adoption=True)  # Use the exact value from choices
        serializer = AnimalSerializer(animals, many=True)
        #print("test",serializer.data)  
        return Response(serializer.data)

class AnimalDetailView(APIView):
    def get(self, request, pk):
        try:
            animal = Animal.objects.get(pk=pk)
            print("test", animal.image)
        except Animal.DoesNotExist:
            return Response({"error": "Animal not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AnimalSerializer(animal)
        return Response(serializer.data)

class DemandeAdoptionAPIView(APIView):
    """API view for users to create and view their adoption requests"""
    
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Automatically create an adoption request for the logged-in user"""
        serializer = DemandeAdoptionSerializer(data=request.data, context={'request': request})  # Pass the request context
        if serializer.is_valid():
            serializer.save(utilisateur=request.user)  # Associate the logged-in user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        notifications = Notification.objects.filter(utilisateur=request.user, lu=False)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, utilisateur=request.user)
            notification.lu = True  # Mark as read
            notification.save()
            return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        
def search_animals(request):
    query = request.GET.get('query', '')
    animal_type = request.GET.get('type', '')
    species = request.GET.get('species', '')

    # Build the query
    filters = Q()
    if query:
        filters &= Q(nom__icontains=query)
    if animal_type:
        filters &= Q(espece__iexact=animal_type)
    if species:
        filters &= Q(race__iexact=species)

    # Fetch filtered animals
    animals = Animal.objects.filter(filters, disponible_pour_adoption=True, type_garde='Définitive')
    animals = AnimalSerializer(animals, many=True).data
    return JsonResponse(list(animals), safe=False)
def get_animal_by_id(request, animal_id):
    """
    Get a single animal by ID
    """
    query = request.GET.get('query', '')
    animal_type = request.GET.get('type', '')
    species = request.GET.get('species', '')

    # Build the query
    filters = Q()
    if query:
        filters &= Q(nom__icontains=query)
    if animal_type:
        filters &= Q(espece__iexact=animal_type)
    if species:
        filters &= Q(race__iexact=species)
    try:
        animal = get_object_or_404(Animal, id=animal_id).filter(filters, disponible_pour_adoption=True, type_garde='Définitive')
        animal_data = AnimalSerializer(animal).data
        return JsonResponse(animal_data)
    except Animal.DoesNotExist:
        return JsonResponse({'error': 'Animal not found'}, status=404)
    
class UserAcceptedTemporaryAnimalsView(generics.ListAPIView):
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filter animals based on historical garde requests that were accepted
        return Animal.objects.filter(
            historiquegarderie__utilisateur=user,        # Link to the logged-in user
            historiquegarderie__statut_nouveau="Acceptee",  # Only accepted requests
            historiquegarderie__type_garde="Temporaire"  # Only temporary garde
        ).distinct()
    
class UserAcceptedDefinitiveAnimalsView(generics.ListAPIView):
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filter animals based on historical garde requests that were accepted
        return Animal.objects.filter(
            historiquegarderie__utilisateur=user,        # Link to the logged-in user
            historiquegarderie__statut_nouveau="Acceptee",  # Only accepted requests
            historiquegarderie__type_garde="Définitive"  # Only temporary garde
        ).distinct()
class UserAcceptedAdoptionAnimalsView(generics.ListAPIView):
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filter animals based on historical garde requests that were accepted
        return Animal.objects.filter(
            historiqueadoption__utilisateur=user,        # Link to the logged-in user
            historiqueadoption__statut_nouveau="Acceptee",  # Only accepted requests
            
        ).distinct()

# views.py
class EvenementMarcheChienUserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get upcoming events (current date or future)
        today = date.today()
        evenements = EvenementMarcheChien.objects.filter(date__gte=today).order_by('date')
        serializer = EvenementMarcheChienSerializer(evenements, many=True)
        return Response(serializer.data)

class EvenementMarcheChienDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            evenement = EvenementMarcheChien.objects.get(pk=pk)
            serializer = EvenementMarcheChienSerializer(evenement)
            
            # Check if user already has a request for this event
            user_demande = DemandeEvenementMarche.objects.filter(
                utilisateur=request.user,
                evenement=evenement
            ).first()
            
            demande_data = None
            if user_demande:
                demande_serializer = DemandeEvenementMarcheSerializer(user_demande)
                demande_data = demande_serializer.data
            
            return Response({
                'evenement': serializer.data,
                'user_demande': demande_data
            })
        except EvenementMarcheChien.DoesNotExist:
            return Response({'error': 'Événement non trouvé'}, status=404)

class DemandeEvenementMarcheCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        evenement_id = request.data.get('evenement')
        chiens_ids = request.data.get('chiens', [])
        
        # Validate number of dogs
        if not chiens_ids:
            return Response({'error': 'Veuillez sélectionner au moins un chien'}, status=400)
        
        if len(chiens_ids) > 3:
            return Response({'error': 'Vous ne pouvez pas sélectionner plus de 3 chiens'}, status=400)
        
        try:
            evenement = EvenementMarcheChien.objects.get(pk=evenement_id)
            
            # Check if dogs are part of the event
            for chien_id in chiens_ids:
                if not evenement.chiens.filter(id=chien_id).exists():
                    return Response({'error': f'Chien avec ID {chien_id} n\'est pas dans cet événement'}, status=400)
            
            # Check if user already has a request for this event
            existing_demande = DemandeEvenementMarche.objects.filter(
                utilisateur=request.user,
                evenement=evenement
            ).first()
            
            if existing_demande:
                # Update existing request
                existing_demande.chiens.clear()
                for chien_id in chiens_ids:
                    chien = Animal.objects.get(id=chien_id)
                    existing_demande.chiens.add(chien)
                
                # If it was rejected before, set back to pending
                if existing_demande.statut == 'Refusee':
                    existing_demande.statut = 'En attente'
                    existing_demande.save()
                    
                serializer = DemandeEvenementMarcheSerializer(existing_demande)
                return Response(serializer.data)
            else:
                # Create new request
                demande = DemandeEvenementMarche.objects.create(
                    utilisateur=request.user,
                    evenement=evenement,
                    statut='En attente'
                )
                
                for chien_id in chiens_ids:
                    chien = Animal.objects.get(id=chien_id)
                    demande.chiens.add(chien)
                
               
                
        except EvenementMarcheChien.DoesNotExist:
            return Response({'error': 'Événement non trouvé'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class UserDemandesEvenementMarcheView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        demandes = DemandeEvenementMarche.objects.filter(utilisateur=request.user).order_by('-date_demande')
        serializer = DemandeEvenementMarcheSerializer(demandes, many=True)
        return Response(serializer.data)