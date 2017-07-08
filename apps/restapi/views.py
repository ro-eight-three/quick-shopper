from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import viewsets, mixins
from rest_framework.decorators import detail_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from qshop.models import Shoplist, Buyable, Buydetail
from . import serializers
from .permissions import IsOwner, IsOwnerOfShoplist


class ShoplistViewSet(viewsets.ModelViewSet):
    queryset = Shoplist.objects.all()
    serializer_class = serializers.ShoplistSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    @detail_route(permission_classes=(IsAuthenticated, IsOwner))
    def buydetails(self, request, *args, **kwargs):
        shoplist = self.get_object()
        buydetails = Buydetail.objects.filter(shoplist=shoplist)
        buydetail_serializer = serializers.BuydetailSerializer(
            buydetails, many=True, context={'request': request})
        return Response(buydetail_serializer.data)

    def perform_create(self, serializer):
        if Shoplist.objects.filter(
                name__iexact=serializer.validated_data['name']):
            raise ValueError("Shoplist with such name already exists")
        # put the owner
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        for buydetail in Buydetail.objects.filter(shoplist=instance):
            buydetail.delete()
        instance.delete()

    def get_queryset(self):
        return Shoplist.objects.filter(owner=self.request.user)


class BuyableViewSet(viewsets.ModelViewSet):
    queryset = Buyable.objects.all()
    serializer_class = serializers.BuyableSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        return Buyable.objects.filter(owner=self.request.user)


class BuydetailViewSet(mixins.CreateModelMixin, mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """
    ViewSet for Buydetails without the list mixin
    ... that's the easiest way to not have to worry about user access
    List is done more easily with ShoplistViewSet anyway.
    Permissions make sure other actions can't be performed by
    non owners
    """
    queryset = Buydetail.objects.all()
    serializer_class = serializers.BuydetailSerializer
    permission_classes = (IsAuthenticated, IsOwnerOfShoplist)
