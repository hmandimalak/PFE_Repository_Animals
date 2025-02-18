# animals/models.py
from django.db import models
from datetime import date
from django.conf import settings
from django.core.exceptions import ValidationError

class Animal(models.Model):
    SEXE_CHOICES = [
        ('M', 'Male'),
        ('F', 'Femelle'),
    ]
    
    TYPE_GARDE_CHOICES = [
        ('Temporaire', 'Temporaire'),
        ('Définitive', 'Définitive'),
    ]

    nom = models.CharField(max_length=100)
    espece = models.CharField(max_length=50)  # Ex : Chien, Chat
    race = models.CharField(max_length=100, blank=True, null=True)
    date_naissance = models.DateField()  # Stocke la date de naissance
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='animaux/', blank=True, null=True)

    # Disponibilité
    disponible_pour_adoption = models.BooleanField(default=False)
    disponible_pour_garde = models.BooleanField(default=False)
    
    # Type de garde (si applicable)
    type_garde = models.CharField(max_length=20, choices=TYPE_GARDE_CHOICES, default='Temporaire') 

    # Dates de garde temporaire
    date_reservation = models.DateField(blank=True, null=True)
    date_fin = models.DateField(blank=True, null=True)

    # Dates et suivi
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} ({self.espece})"

    def age(self):
        """ Calcule l'âge de l'animal à partir de la date de naissance. """
        today = date.today()
        return today.year - self.date_naissance.year - ((today.month, today.day) < (self.date_naissance.month, self.date_naissance.day))
        

    def en_garde_actuellement(self):
        """ Vérifie si l'animal est actuellement en garde temporaire """
        today = date.today()
        if self.type_garde == "Temporaire" and self.date_reservation and self.date_fin:
            return self.date_reservation <= today <= self.date_fin
        return False


class DemandeGarde(models.Model):
    STATUS_CHOICES = [
        ('En attente', 'En attente'),
        ('Acceptee', 'Acceptee'),
        ('Refusee', 'Refusee'),
    ]
    TYPE_GARDE_CHOICES = [
        ('Temporaire', 'Temporaire'),
        ('Définitive', 'Définitive'),
    ]

    animal = models.ForeignKey('Animal', on_delete=models.CASCADE, related_name='demandes_garde')
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='demandes_garde')
    date_demande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='En attente')
    message = models.TextField(blank=True, null=True)
    type_garde = models.CharField(max_length=20, choices=TYPE_GARDE_CHOICES, default='Temporaire') 
    image = models.ImageField(upload_to='animaux/', blank=True, null=True)



    def __str__(self):
        return f"Demande de garde pour {self.animal.nom} par {self.utilisateur.nom} ({self.statut})"


class DemandeAdoption(models.Model):
    STATUS_CHOICES = [
        ('En attente', 'En attente'),
        ('Acceptee', 'Acceptee'),
        ('Refusee', 'Refusee'),
    ]

    animal = models.ForeignKey('Animal', on_delete=models.CASCADE, related_name='demandes_adoption')
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='demandes_adoption')
    date_demande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='En attente')
    message = models.TextField(blank=True, null=True)

    def clean(self):
        """ Ensure that the animal is available for adoption before saving the request. """
        if not self.animal.disponible_pour_adoption:
            raise ValidationError(f"L'animal {self.animal.nom} n'est pas disponible pour adoption.")

    def save(self, *args, **kwargs):
        self.clean()  # Call validation before saving
        super().save(*args, **kwargs)


    def __str__(self):
        return f"Demande d'adoption pour {self.animal.nom} par {self.utilisateur.nom} ({self.statut})"
    
class Notification(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)  # Mark as read/unread

    def __str__(self):
        return f"Notification for {self.utilisateur.nom}"
