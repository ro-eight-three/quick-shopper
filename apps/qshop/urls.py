from django.conf.urls import url
from . import views

app_name = 'qshop'
urlpatterns = [url(r'^$', views.alljs, name='alljs')]
