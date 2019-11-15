from django.urls import path

from . import views

urlpatterns = [
    # ex: /service/
    path('', views.index, name='index')
    # ex: /service/BlastN/
    # path('<int:question_id>/', views.detail, name='detail')

]