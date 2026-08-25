from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class JobApplication(models.Model):
    STATUS_CHOICES = [

     ('applied', 'Applied'),
     ('interview', 'Interview'),
     ('offer', 'Offer'),
     ('rejected' ,'Rejected'),

    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_date = models.DateField()
    job_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company} - {self.role}"