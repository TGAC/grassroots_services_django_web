from django.urls import path
from django.urls import re_path

from . import views

urlpatterns = [
    # ex: /service/
    path('', views.index, name='index'),

    path('ajax/get_all_services/', views.index_ajax),
    path('ajax/get_one_service/', views.single_service_ajax),

    re_path(r'(?P<service_name>[A-z0-9-]+)$', views.single_service),




]