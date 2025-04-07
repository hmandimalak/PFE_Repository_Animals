from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.decorators import login_required
from .models import Produit, Panier, ArticlesPanier, Commande, ArticlesCommande
import json
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend



# Existing views
def get_produits(request):
    products = Produit.objects.all()
    
    # Apply category filter
    categorie = request.GET.get('categorie')
    if categorie:
        products = products.filter(categorie=categorie)
    
    # Apply search
    search = request.GET.get('search')
    if search:
        products = products.filter(nom__icontains=search)
    
    # Apply ordering
    ordering = request.GET.get('ordering')
    if ordering:
        products = products.order_by(ordering)
    
    # Return values as list
    product_values = products.values('id', 'nom', 'description', 'prix', 'image_url', 'categorie')
    return JsonResponse(list(product_values), safe=False)

def produit_detail(request, produit_id):
    product = Produit.objects.filter(id=produit_id).values('id', 'nom', 'description', 'prix', 'image_url', 'categorie').first()
    if product:
        return JsonResponse(product)
    else:
        return JsonResponse({'error': 'Product not found'}, status=404)

# New cart views
@api_view(['GET'])
@login_required
def get_panier(request):
    """Get the current user's cart"""
    panier, created = Panier.objects.get_or_create(utilisateur=request.user)
    articles = ArticlesPanier.objects.filter(panier=panier)
    
    cart_items = []
    for article in articles:
        cart_items.append({
            'id': article.produit.id,
            'nom': article.produit.nom,
            'prix': float(article.produit.prix),
            'image_url': article.produit.image_url,
            'quantity': article.quantite
        })
    
    return Response(cart_items)

@api_view(['POST'])
@login_required
def ajouter_au_panier(request):
    data = json.loads(request.body)
    produit_id = data.get('produit_id')
    quantite = data.get('quantity', 1)

    produit = get_object_or_404(Produit, id=produit_id)
    panier, created = Panier.objects.get_or_create(utilisateur=request.user)

    article, created = ArticlesPanier.objects.get_or_create(
        panier=panier,
        produit=produit,
        defaults={'quantite': quantite}
    )

    if not created:
        article.quantite += quantite
        article.save()

    return Response({'status': 'success', 'message': 'Produit ajouté au panier'})




@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_quantite(request, produit_id):
    """
    Update the quantity of a product in the cart
    """
    data = json.loads(request.body)
    quantity = data.get('quantity')
    
    if quantity is None:
        return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get or create user's cart
    panier, created = Panier.objects.get_or_create(utilisateur=request.user)
    
    # Check if product exists
    try:
        produit = Produit.objects.get(id=produit_id)
    except Produit.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get or create the cart item
    if quantity > 0:
        article, created = ArticlesPanier.objects.get_or_create(
            panier=panier,
            produit_id=produit_id,
            defaults={'quantite': quantity}
        )
        
        if not created:
            article.quantite = quantity
            article.save()
        
        return Response({
            'success': True, 
            'message': 'Cart updated',
            'product': {
                'id': produit.id,
                'nom': produit.nom,
                'prix': float(produit.prix),
                'image_url': produit.image_url,
                'quantity': quantity
            }
        })
    else:
        # If quantity is 0, make sure to remove it if it exists
        ArticlesPanier.objects.filter(panier=panier, produit_id=produit_id).delete()
        return Response({'success': True, 'message': 'Product removed from cart'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_du_panier(request, produit_id):
    """
    Remove a product from the cart
    """
    # Get user's cart
    try:
        panier = Panier.objects.get(utilisateur=request.user)
    except Panier.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Delete the cart item
    try:
        article = ArticlesPanier.objects.get(panier=panier, produit_id=produit_id)
        article.delete()
        return Response({'success': True, 'message': 'Product removed from cart'})
    except ArticlesPanier.DoesNotExist:
        return Response({'error': 'Product not in cart'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def creer_commande(request):
    """
    Create a new order from the cart items and reduce product inventory
    """
    # Get user's cart
    try:
        panier = Panier.objects.get(utilisateur=request.user)
    except Panier.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all cart items
    articles = ArticlesPanier.objects.filter(panier=panier).select_related('produit')
    
    if not articles:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Use transaction to ensure database consistency
    with transaction.atomic():
        # Check inventory before proceeding
        for article in articles:
            # Assuming your Product model has a 'stock' or 'quantite' field
            if article.produit.stock < article.quantite:
                return Response({
                    'error': f'Not enough stock for {article.produit.nom}. Available: {article.produit.stock}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate total price
        total_prix = sum(article.produit.prix * article.quantite for article in articles)
        
        # Create the order
        commande = Commande.objects.create(
            utilisateur=request.user,
            total_prix=total_prix,
            statut="En attente",
            
        )
        
        # Create order items and reduce inventory
        for article in articles:
            # Create order item
            ArticlesCommande.objects.create(
                commande=commande,
                produit=article.produit,
                quantite=article.quantite,
               
            )
            
            # Reduce product inventory
            article.produit.stock -= article.quantite
            article.produit.save()
        
        # Empty the cart
        articles.delete()
        
        return Response({
            'success': True,
            'message': 'Order created successfully',
            'numero_commande': commande.numero_commande
        })