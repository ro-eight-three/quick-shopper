from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permissions only allow owner to do stuff
    """

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsOwnerOfShoplist(permissions.BasePermission):
    """
    Custom permission for buydetail
    Only owner of the shoplist has access
    """

    def has_object_permission(self, request, view, obj):
        return obj.shoplist.owner == request.user
