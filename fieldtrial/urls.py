from django.urls import path
from django.urls import re_path

from . import views

urlpatterns = [
    # ex: /fieldtrial/
    path('', views.index, name='index'),

    re_path(r'(?P<fieldtrial_id>[A-z0-9-\w%]+)$', views.single_fieldtrial),

    # re_path('study/r'(?P<fieldtrial_id>[A-z0-9-\w%]+)$', views.single_fieldtrial),
    # re_path('plot/r'(?P<fieldtrial_id>[A-z0-9-\w%]+)$', views.single_fieldtrial),
    # path('ajax/get_one_service/', views.single_service_ajax),
    # path('ajax/interact_backend/', views.interact_with_apache),
    # path('ajax/search_treatment/', views.search_treatment_ajax),
    # path('ajax/submit_form/', views.submit_form_ajax),
    # path('ajax/check_result/', views.check_result_ajax),
    #
    # path('api/co_ols', views.crop_ontology_search),
]