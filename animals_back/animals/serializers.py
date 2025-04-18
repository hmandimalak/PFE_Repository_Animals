# animals/serializers.py
from rest_framework import serializers
from .models import Animal, DemandeEvenementMarche, DemandeGarde, DemandeAdoption, EvenementMarcheChien,Notification
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

    def get_utilisateur_nom(self, obj):
        # Get the latest accepted garde request for this animal
        demande = obj.demandes_garde.filter(statut='Acceptee').order_by('-date_demande').first()
        if demande:
            return demande.utilisateur.nom
        return None


class DemandeGardeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DemandeGarde
        fields = '__all__'
        extra_kwargs = {'statut': {'required': False}} 

    def create(self, validated_data):
        request = self.context['request']
        utilisateur = request.user
        validated_data['utilisateur'] = utilisateur
        # Pop out the image from validated_data if present
        image = validated_data.pop('image', None)
        instance = DemandeGarde.objects.create(**validated_data)

        # If no image was provided via the request but you want to copy it from the animal,
        # you can retrieve it from the animal instance (assuming it was already saved)
        if not image and instance.animal.image:
            # Copy the file from animal to DemandeGarde
            instance.image.save(instance.animal.image.name, instance.animal.image.file, save=True)
        elif image:
            # If image was provided, it will already be handled
            instance.image = image
            instance.save()

        return instance

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['type_garde'].choices = [('Temporaire', 'Temporaire'), ('Définitive', 'Définitive')]
    
    def get_image_url(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image.name}"
        return None

    def get_image_url(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image.name}"
        return None

from rest_framework import serializers
from .models import DemandeAdoption

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

    def validate(self, attrs):
        """ Ensure that the user cannot send multiple requests for the same animal. """
        user = self.context['request'].user
        animal = attrs.get('animal')

        if DemandeAdoption.objects.filter(utilisateur=user, animal=animal).exists():
            raise serializers.ValidationError("Vous avez déjà envoyé une demande d'adoption pour cet animal.")

        return attrs
        

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class DemandeEvenementMarcheSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.nom', read_only=True)
    chiens_details = AnimalSerializer(source='chiens', many=True, read_only=True)
    evenement_titre = serializers.CharField(source='evenement.titre', read_only=True)
    
    class Meta:
        model = DemandeEvenementMarche
        fields = ['id', 'utilisateur', 'utilisateur_nom', 'evenement', 'evenement_titre', 
                  'chiens', 'chiens_details', 'date_demande', 'statut']
class EvenementMarcheChienSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvenementMarcheChien
        fields = '__all__'
        

