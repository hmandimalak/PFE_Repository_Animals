from rest_framework import serializers
<<<<<<< HEAD
from .models import ArticlesCommande, Commande, Notification, Produit
=======
from .models import Notification, Produit,Commande,ArticlesCommande
>>>>>>> 552f46f45d223de8dfd76baf4f43aa2ec0fb1847

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
class CommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commande
<<<<<<< HEAD
        fields = 'all'
=======
        fields = '__all__'
>>>>>>> 552f46f45d223de8dfd76baf4f43aa2ec0fb1847
class ArticlesCommandeSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='produit.nom')
    image_url = serializers.CharField(source='produit.image_url')
    prix = serializers.DecimalField(source='prix_unitaire', max_digits=10, decimal_places=2)
<<<<<<< HEAD

    class Meta:
        model = ArticlesCommande
        fields = ['id', 'nom', 'image_url', 'quantite', 'prix']
class CommandeDetailSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

=======
    
    class Meta:
        model = ArticlesCommande
        fields = ['id', 'nom', 'image_url', 'quantite', 'prix']

class CommandeDetailSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    
>>>>>>> 552f46f45d223de8dfd76baf4f43aa2ec0fb1847
    class Meta:
        model = Commande
        fields = ['id', 'numero_commande', 'total_prix', 'statut', 'date_commande', 
                 'adresse_livraison', 'methode_paiement', 'items']
<<<<<<< HEAD

=======
    
>>>>>>> 552f46f45d223de8dfd76baf4f43aa2ec0fb1847
    def get_items(self, obj):
        articles = ArticlesCommande.objects.filter(commande=obj)
        return ArticlesCommandeSerializer(articles, many=True).data
