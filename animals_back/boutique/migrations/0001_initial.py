# Generated by Django 5.1.5 on 2025-04-08 08:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Produit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('serial_number', models.CharField(blank=True, max_length=10, unique=True)),
                ('nom', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('prix', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock', models.IntegerField(default=0)),
                ('categorie', models.CharField(choices=[('Nutrition', 'Nutrition'), ('Accessoires', 'Accessoires'), ('Hygiène', 'Hygiène')], default='Nutrition', max_length=20)),
                ('image_url', models.URLField(blank=True, null=True)),
                ('date_ajout', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Commande',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero_commande', models.CharField(blank=True, max_length=10, unique=True)),
                ('total_prix', models.DecimalField(decimal_places=2, max_digits=10)),
                ('statut', models.CharField(choices=[('En attente', 'En attente'), ('Payée', 'Payée'), ('Expédiée', 'Expédiée'), ('Livrée', 'Livrée')], default='En attente', max_length=50)),
                ('date_commande', models.DateTimeField(auto_now_add=True)),
                ('adresse_livraison', models.TextField(blank=True, null=True)),
                ('telephone', models.CharField(blank=True, max_length=20, null=True)),
                ('methode_paiement', models.CharField(default='livraison', max_length=50)),
                ('utilisateur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Panier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('utilisateur', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ArticlesPanier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite', models.PositiveIntegerField(default=1)),
                ('date_ajout', models.DateTimeField(auto_now_add=True)),
                ('panier', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='boutique.panier')),
                ('produit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='boutique.produit')),
            ],
        ),
        migrations.CreateModel(
            name='ArticlesCommande',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite', models.PositiveIntegerField(default=1)),
                ('prix_unitaire', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('commande', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='boutique.commande')),
                ('produit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='boutique.produit')),
            ],
        ),
    ]
