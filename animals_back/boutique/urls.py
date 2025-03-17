from django.urls import path
from . import views

urlpatterns = [
    path('produits/', views.get_produits, name='get_produits'),
    path('produits/<int:produit_id>/', views.produit_detail, name='produit_detail'),

    path('panier/', views.get_panier, name='get_panier'),
    path('panier/ajouter/', views.ajouter_au_panier, name='ajouter_au_panier'),
    path('panier/update/<int:produit_id>/', views.update_quantite, name='update_quantite'),
    path('panier/supprimer/<int:produit_id>/', views.supprimer_du_panier, name='supprimer_du_panier'),
    path('commander/', views.creer_commande, name='creer_commande'),
]
