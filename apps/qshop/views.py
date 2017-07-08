from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def alljs(request):
    return render(request, 'qshop/alljs.html')
