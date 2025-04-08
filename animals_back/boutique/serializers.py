from rest_framework import serializers
from .models import Notification, Produit

### 📦 Serializer Produit ###
class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        ordering = ['id']  # Default ordering by ID
        model = Produit
        fields = '__all__'
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
