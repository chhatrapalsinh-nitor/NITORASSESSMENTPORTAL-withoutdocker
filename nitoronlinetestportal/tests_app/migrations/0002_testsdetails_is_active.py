# Generated by Django 3.1.7 on 2023-01-24 14:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='testsdetails',
            name='is_active',
            field=models.BooleanField(default=False),
        ),
    ]
