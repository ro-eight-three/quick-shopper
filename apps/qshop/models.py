from django.db import models
from django.contrib.auth.models import User


class Shoplist(models.Model):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Buyable(models.Model):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    # last_use = models.DateField()

    def __str__(self):
        return self.name


class Buydetail(models.Model):
    shoplist = models.ForeignKey(Shoplist, on_delete=models.CASCADE)
    buyable = models.ForeignKey(Buyable, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    # note = models.CharField(max_length=50)
    picked = models.BooleanField(default=False)

    def __str__(self):
        return self.buyable.name
