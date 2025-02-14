# animals/serializers.py
from rest_framework import serializers
from .models import Animal, DemandeGarde, DemandeAdoption

class AnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = ['id', 'nom', 'espece', 'race', 'date_naissance', 'sexe', 'description', 'image', 'disponible_pour_adoption', 'disponible_pour_garde', 'type_garde', 'date_reservation', 'date_fin', 'date_creation']

class DemandeGardeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandeGarde
        fields = '__all__'
        extra_kwargs = {'statut': {'required': False}} 

    def create(self, validated_data):
        utilisateur = self.context['request'].user  # Get the current logged-in user
        validated_data['utilisateur'] = utilisateur
        return super().create(validated_data)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['type_garde'].choices = [('Temporaire', 'Temporaire'), ('Définitive', 'Définitive')]

class DemandeAdoptionSerializer(serializers.ModelSerializer):
    animal = AnimalSerializer()
    utilisateur = serializers.StringRelatedField()  # Or another serializer for the user if needed

    class Meta:
        model = DemandeAdoption
        fields = ['id', 'animal', 'utilisateur', 'date_demande', 'statut', 'message']
