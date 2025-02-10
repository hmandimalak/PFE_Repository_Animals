from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Animal, DemandeGarde, DemandeAdoption
from .serializers import AnimalSerializer, DemandeGardeSerializer, DemandeAdoptionSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser




# Gestion des animaux et demande de garde
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
                'animal': animal.id,  # Link the created animal to the request
                'utilisateur': request.user.id,  # Ensure user ID is passed (instead of the user object)
                'statut': 'En attente',  # Default status for new requests
                'message': request.data.get('message', '')  # Optionally, include a message
            }
            
            # Pass the request context to the serializer
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
