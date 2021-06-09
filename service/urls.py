from django.urls import path
from django.urls import re_path

from . import views

urlpatterns = [
    # ex: /service/
    path('', views.index, name='index'),

    path('ajax/get_all_services/', views.index_ajax),
    path('ajax/get_one_service/', views.single_service_ajax),
    path('ajax/interact_backend/', views.interact_with_apache),

    path('private/', views.private_index),
    path('private/ajax/get_all_services/', views.private_index_ajax),
    path('private/ajax/get_one_service/', views.private_single_service_ajax),
    path('private/ajax/interact_backend/', views.private_interact_with_apache),
    re_path(r'private/(?P<service_alt_name>[A-z0-9-\w%]+)$', views.private_single_service),

    path('queen/', views.queen_index),
    path('queen/ajax/get_all_services/', views.queen_index_ajax),
    path('queen/ajax/get_one_service/', views.queen_single_service_ajax),
    path('queen/ajax/interact_backend/', views.queen_interact_with_apache),
    re_path(r'queen/(?P<service_alt_name>[A-z0-9-\w%]+)$', views.queen_single_service),

    path('api/co_ols', views.crop_ontology_search),
    path('payload/<payload>', views.single_service_with_payload),
    path('search/<search_q>', views.single_service_search_q),
    re_path(r'(?P<service_alt_name>[A-z0-9-\w%]+)$', views.single_service),
]