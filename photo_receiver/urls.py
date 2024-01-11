# photo_receiver/urls.py

from django.urls import path
from .views import PhotoUploadView  # Import your view
from .views import PhotoRetrieveView  
from .views import LimitsFileRetrieve
from .views import LimitsFileUpdate

urlpatterns = [
    path('upload/', PhotoUploadView.as_view(), name='photo-upload'),
    path('retrieve_photo/<str:subfolder>/<str:photo_name>/', PhotoRetrieveView.as_view(), name='retrieve-photo'),
    path('retrieve_limits/<str:subfolder>/', LimitsFileRetrieve.as_view(), name='retrieve-limits'),
     path('update_limits/<str:subfolder>/', LimitsFileUpdate.as_view(), name='update_limits'),
]
