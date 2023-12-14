# photo_receiver/urls.py

from django.urls import path
from .views import PhotoUploadView  # Import your view
from .views import PhotoRetrieveView  # Import your view

urlpatterns = [
    path('upload/', PhotoUploadView.as_view(), name='photo-upload'),
    path('retrieve_photo/<str:subfolder>/<str:photo_name>/', PhotoRetrieveView.as_view(), name='retrieve-photo'),
]
