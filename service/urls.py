from django.urls import path

from . import views

urlpatterns = [
    # ex: /service/
    path('', views.index, name='index'),
    path('get_all_services/', views.index_ajax)
    # ex: /service/BlastN/
    # path('<int:question_id>/', views.detail, name='detail')

]