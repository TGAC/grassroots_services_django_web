from django.urls import path
from django.urls import re_path

from . import views

urlpatterns = [
    # ex: /service/
    path('', views.index, name='index'),

    path('ajax/get_all_services/', views.index_ajax),
    path('ajax/get_one_service/', views.single_service_ajax),
    path('ajax/interact_backend/', views.interact_with_apache),
    path('ajax/search_treatment/', views.search_treatment_ajax),
    path('ajax/submit_form/', views.submit_form_ajax),
    path('ajax/check_result/', views.check_result_ajax),

    path('api/co_ols', views.crop_ontology_search),
    path('payload/<payload>', views.single_service_with_payload),
    re_path(r'(?P<service_alt_name>[A-z0-9-\w%]+)$', views.single_service),
]