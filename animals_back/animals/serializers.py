# animals/serializers.py
from rest_framework import serializers
from .models import Animal, DemandeGarde, DemandeAdoption,Notification
from django.conf import settings


class AnimalSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    utilisateur_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Animal
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = f"{settings.MEDIA_URL}{instance.image.name}"
        return representation

    def get_image_url(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image.name}"
        return None
        
    def get_utilisateur_nom(self, obj):
        # Get the latest accepted garde request for this animal
        demande = obj.demandes_garde.filter(statut='Acceptee').order_by('-date_demande').first()
        if demande:
            return demande.utilisateur.nom
        return None


class DemandeGardeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)  # Make it optional but handle it when present
    image_url = serializers.SerializerMethodField()
    
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
    
    def get_image_url(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image.name}"
        return None

class DemandeAdoptionSerializer(serializers.ModelSerializer):
    animal = serializers.PrimaryKeyRelatedField(queryset=Animal.objects.all())  # Expecting animal_id
    utilisateur = serializers.StringRelatedField()  # Or another serializer for the user if needed

    class Meta:
        model = DemandeAdoption
        fields = ['id', 'animal', 'utilisateur', 'date_demande', 'statut', 'message']
    def validate_animal(self, value):
        """ Ensure that the animal is available for adoption. """
        if not value.disponible_pour_adoption:
            raise serializers.ValidationError(f"L'animal {value.nom} n'est pas disponible pour adoption.")
        return value

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
