# Generated by Django 5.1.5 on 2025-02-12 14:14

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
            name='Animal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100)),
                ('espece', models.CharField(max_length=50)),
                ('race', models.CharField(blank=True, max_length=100, null=True)),
                ('date_naissance', models.DateField()),
                ('sexe', models.CharField(choices=[('M', 'Male'), ('F', 'Femelle')], max_length=1)),
                ('description', models.TextField(blank=True, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='animaux/')),
                ('disponible_pour_adoption', models.BooleanField(default=False)),
                ('disponible_pour_garde', models.BooleanField(default=False)),
                ('type_garde', models.CharField(blank=True, choices=[('Temporaire', 'Temporaire'), ('Définitive', 'Définitive')], max_length=20, null=True)),
                ('date_reservation', models.DateField(blank=True, null=True)),
                ('date_fin', models.DateField(blank=True, null=True)),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='DemandeAdoption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_demande', models.DateTimeField(auto_now_add=True)),
                ('statut', models.CharField(choices=[('En attente', 'En attente'), ('Acceptee', 'Acceptee'), ('Refusee', 'Refusee')], default='En attente', max_length=20)),
                ('message', models.TextField(blank=True, null=True)),
                ('animal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandes_adoption', to='animals.animal')),
                ('utilisateur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandes_adoption', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='DemandeGarde',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_demande', models.DateTimeField(auto_now_add=True)),
                ('statut', models.CharField(choices=[('En attente', 'En attente'), ('Acceptee', 'Acceptee'), ('Refusee', 'Refusee')], default='En attente', max_length=20)),
                ('message', models.TextField(blank=True, null=True)),
                ('animal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandes_garde', to='animals.animal')),
                ('utilisateur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demandes_garde', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
