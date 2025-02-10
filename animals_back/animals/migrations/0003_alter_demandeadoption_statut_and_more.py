# Generated by Django 5.1.5 on 2025-02-10 09:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0002_alter_animal_sexe'),
    ]

    operations = [
        migrations.AlterField(
            model_name='demandeadoption',
            name='statut',
            field=models.CharField(choices=[('En attente', 'En attente'), ('Acceptee', 'Acceptee'), ('Refusee', 'Refusee')], default='En attente', max_length=20),
        ),
        migrations.AlterField(
            model_name='demandegarde',
            name='statut',
            field=models.CharField(choices=[('En attente', 'En attente'), ('Acceptee', 'Acceptee'), ('Refusee', 'Refusee')], default='En attente', max_length=20),
        ),
    ]
