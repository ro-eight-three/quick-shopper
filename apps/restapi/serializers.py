from rest_framework import serializers
from qshop.models import Shoplist, Buyable, Buydetail
from django.contrib.auth.models import User


class ShoplistSerializer(serializers.HyperlinkedModelSerializer):
    buydetails = serializers.HyperlinkedIdentityField(
        view_name='shoplist-buydetails')

    class Meta:
        model = Shoplist
        fields = ('url', 'id', 'name', "buydetails")


class BuyableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyable
        fields = ('id', 'name')


class BuydetailSerializer(serializers.ModelSerializer):
    buyable_name = serializers.ReadOnlyField(source='buyable.name')
    url = serializers.HyperlinkedIdentityField(view_name="buydetail-detail")

    class Meta:
        model = Buydetail
        fields = ('url', 'id', 'shoplist', 'buyable', 'quantity',
                  'buyable_name', 'picked')
