from rest_framework import serializers
from .models import Produit

### 📦 Serializer Produit ###
class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        ordering = ['id']  # Default ordering by ID
        model = Produit
        fields = '__all__'
