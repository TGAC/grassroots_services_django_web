# Import path module
from django.urls import path
from django.urls import re_path
# Import views
from filedownload import views

# Set path for download
app_name = 'download'
urlpatterns = [
    #path('', views.index, name='index'),
    #path('', views.download_file, name='download'),
    path('<filename>', views.download_CSV, name='download'),
]
