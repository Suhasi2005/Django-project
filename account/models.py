from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    
    # Required to avoid clashes with default User model
    groups = models.ManyToManyField(
        'auth.Group',
        related_name="account_user_set",
        related_query_name="account_user",
        blank=True,
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name="account_user_set",
        related_query_name="account_user",
        blank=True,
        help_text='Specific permissions for this user.',
    )

    def __str__(self):
        return self.username