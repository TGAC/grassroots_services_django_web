# photo_receiver/urls.py

from django.urls import path
from .views import PhotoUploadView  # Import your view
from .views import PhotoRetrieveView  
from .views import LimitsFileRetrieve
from .views import LimitsFileUpdate
from .views import LatestPhoto
from .views import AllowedStudiesView

urlpatterns = [
    path('upload/', PhotoUploadView.as_view(), name='photo-upload'),
    path('retrieve_photo/<str:subfolder>/<str:photo_name>/', PhotoRetrieveView.as_view(), name='retrieve-photo'),
    path('retrieve_limits/<str:subfolder>/', LimitsFileRetrieve.as_view(), name='retrieve-limits'),
    path('update_limits/<str:subfolder>/', LimitsFileUpdate.as_view(), name='update_limits'),
    path('retrieve_latest_photo/<str:subfolder>/<int:plot_number>/', LatestPhoto.as_view(), name='retrieve-latest-photo'),
    path('allowed_studies/', AllowedStudiesView.as_view(), name='allowed_studies')
]
