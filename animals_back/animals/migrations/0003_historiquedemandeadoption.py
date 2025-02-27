# Generated by Django 5.1.5 on 2025-02-24 14:39

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0002_historiquedemandegarde'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoriqueDemandeAdoption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('statut_precedent', models.CharField(max_length=20)),
                ('statut_nouveau', models.CharField(max_length=20)),
                ('date_changement', models.DateTimeField(auto_now_add=True)),
                ('animal', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='historiqueadoption', to='animals.animal')),
                ('demande', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='historique', to='animals.demandeadoption')),
                ('utilisateur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
