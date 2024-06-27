# photo_receiver/urls.py

from django.urls import path
from django.urls import re_path
from .views import PhotoUploadView  # Import your view
from .views import PhotoRetrieveView  
from .views import LimitsFileRetrieve
from .views import LimitsFileUpdate
from .views import LatestPhoto
from .views import oauth_callback

urlpatterns = [
    path('upload/', PhotoUploadView.as_view(), name='photo-upload'),
    path('retrieve_photo/<str:subfolder>/<str:photo_name>/', PhotoRetrieveView.as_view(), name='retrieve-photo'),
    path('retrieve_limits/<str:subfolder>/', LimitsFileRetrieve.as_view(), name='retrieve-limits'),
    path('update_limits/<str:subfolder>/', LimitsFileUpdate.as_view(), name='update_limits'),
    path('retrieve_latest_photo/<str:subfolder>/<int:plot_number>/', LatestPhoto.as_view(), name='retrieve-latest-photo'),
    #path('auth/callback/', oauth_callback, name='oauth-callback'),
    #path('private/redirect_uri/', oauth_callback, name='original-oauth-callback'),
    re_path(r'^private/redirect_uri/?$', oauth_callback, name='original-oauth-callback'),
]
