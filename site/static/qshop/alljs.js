/*global $, jQuery, document, alert */

$(document).ready(function () {

    ajaxSetupCsrf();

    restGetUrls("/rest/")
        .done(function (data) {
            $(document).data('rest_urls', data);
            doInitialSetup();
        });
});

function doInitialSetup() {

    $('#user-anchor').click(shoplistsShow);

    $('#shoplists-action-create').click(function () {
        showFormModal('#form-shoplist-create');
    });

    $('#buydetails-action-addnew').click(function () {
        showFormModal('#form-buydetail-addnew');
    });

    $('#buydetails-action-addmany').click(setupAndShowAddManyDialog);

    $('#form-shoplist-create > .submit').click(onShoplistCreate);

    $('#form-buydetail-addnew > .submit').click(onBuydetailAddNew);

    $('#shoplists').data('changed', true);

    shoplistsShow();
}

function showFormModal(formId) {
    $('.modal-body').children().addClass('hidden');
    $(formId).removeClass('hidden');
    $('.modal').modal('show');
}

function ajaxFetchJson(fetchUrl, successFunction) {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: fetchUrl,
        success: successFunction,
        error: ajaxErrorHandle
    });
}

function ajaxSetupCsrf() {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

function ajaxErrorHandle(jqXHR, textStatus, errorThrown) {
    alert(textStatus + '\n' + errorThrown);
}

function restGetUrls(restRootUrls) {
    return $.ajax({
        type: "GET",
        dataType: "json",
        url: restRootUrls,
        error: ajaxErrorHandle
    });
}

function restShoplistSaveNew(shoplist_name) {
    return $.ajax({
        type: "POST",
        url: $(document).data('rest_urls').shoplists,
        dataType: "json",
        data: {
            "name": shoplist_name
        },
        error: ajaxErrorHandle
    });
}

function restShoplistDelete(shoplist) {
    return $.ajax({
        type: "DELETE",
        url: shoplist.url,
        error: ajaxErrorHandle
    });
}

function restBuyableSaveNew(buyable_name) {
    return $.ajax({
        type: "POST",
        url: $(document).data('rest_urls').buyables,
        dataType: "json",
        data: {
            "name": buyable_name
        },
        error: ajaxErrorHandle
    });
}

function restBuyableGetAll() {
    return $.ajax({
        type: "GET",
        dataType: "json",
        url: $(document).data('rest_urls').buyables,
        error: ajaxErrorHandle
    });
}

function restBuydetailSaveNew(shoplist_id, buyable_id, quantity) {
    return $.ajax({
        type: "POST",
        url: $(document).data('rest_urls').buydetails,
        dataType: "json",
        data: {
            "shoplist": shoplist_id,
            "buyable": buyable_id,
            "quantity": quantity
        },
        error: ajaxErrorHandle
    });
}

function restBuydetailDelete(buydetail) {
    return $.ajax({
        type: "DELETE",
        url: buydetail.url,
        error: ajaxErrorHandle
    });
}

function restBuydetailUpdate(buydetail) {
    return $.ajax({
        type: "PUT",
        url: buydetail.url,
        dataType: "json",
        data: buydetail,
        error: ajaxErrorHandle
    });
}

function onShoplistCreate() {

    var shoplist_name = $('#form-shoplist-create > input[name="shoplist_name"]').val();
    restShoplistSaveNew(shoplist_name)
        .done(function () {
            $('#shoplists').data('changed', true);
            $('.modal').modal('hide');
            shoplistsShow();
        });
}

function onBuydetailAddNew() {

    var shoplist = $('#buydetails').data('shoplist');
    var buyable_name = $('#form-buydetail-addnew > input[name="buyable_name"]').val();
    var quantity = $('#form-buydetail-addnew > input[name="quantity"]').val();

    restBuyableSaveNew(buyable_name)
        .done(function (newBuyable) {
            restBuydetailSaveNew(shoplist.id, newBuyable.id, quantity)
                .done(function (newBuydetail) {
                    shoplistEdit(shoplist);
                });
        });

    $('.modal').modal('hide');
}

function buyablesPopulateHtml() {

    var $listGroup = $('#buyable-list-group');

    $listGroup
        .children('.list-group-item:not(.template)')
        .remove();

    $.data(document, 'buyables').forEach(function (buyable, index) {
        $listGroup
            .children('.list-group-item.template')
            .clone(true, true)
            .appendTo($listGroup)
            .removeClass('template')
            .removeClass('hidden')
            .data('buyable', buyable)
            .click(onBuydetailAddMany)
            .text(buyable.name)
    });
}

function onBuydetailAddMany(event) {

    var $buydetails = $('#buydetails');
    var shoplist = $buydetails.data('shoplist');
    var buyable = $.data(event.delegateTarget, 'buyable');

    restBuydetailSaveNew(shoplist.id, buyable.id, 1)
        .done(function (savedBuydetail) {
            $(event.delegateTarget).addClass('hidden');
            $buydetails.data('buydetails').push(savedBuydetail);
            buydetailsPopulateHtml();
        });
}

function buyablesHideDuplicatesAndShow() {

    var buydetails = $('#buydetails').data('buydetails');
    var $listGroup = $('#buyable-list-group');

    $listGroup
        .children('.list-group-item:not(.template)')
        .removeClass('hidden');

    $listGroup
        .children('.list-group-item:not(.template)')
        .each(function (index, element) {
            var buyable = $(element).data('buyable');
            var shouldHide = buydetails.some(function (buydetail) {
                return buyable.id == buydetail.buyable;
            });
            if (shouldHide) {
                $(element).addClass('hidden');
            }
        });
    showFormModal('#form-buydetail-addmany');
}

function setupAndShowAddManyDialog() {

    if ($.data(document, 'buyables') == null) {
        restBuyableGetAll()
            .done(function (allBuyables) {
                $.data(document, 'buyables', allBuyables);
                buyablesPopulateHtml();
                buyablesHideDuplicatesAndShow();
            });
    } else {
        buyablesHideDuplicatesAndShow();
    }
}

function shoplistsShow() {

    $('#shoplist-name').text("");
    $('#location-hint').text("Your shoplists");

    if ($('#shoplists').data('changed')) {
        // clear any previous data
        $('#shoplists').data('shoplists', null);

        ajaxFetchJson(
            $(document).data('rest_urls').shoplists,
            function (jsonData) {
                $('#shoplists').data('shoplists', jsonData);
                shoplistsPopulateHtml();
                $('#shoplists').data('changed', false)
                viewMode_shoplists();
            });
    } else {
        viewMode_shoplists();
    }
}

function shoplistsPopulateHtml() {

    $('#shoplists > div.list-group > div.list-group-item:not(.template)').remove();

    $('#shoplists').data('shoplists').forEach(function (shoplist, index) {
        $('#shoplists > div.list-group > div.list-group-item.template')
            .clone(true, true)
            .appendTo('#shoplists > div.list-group')
            .removeClass('template')
            .removeClass('hidden')
            .children('span').children('a.delete-link')
            .click(shoplist, function (event) {
                shoplistDelete(event.data);
            })
            .parent().parent()
            .children('span').children('a.open-link')
            .click(shoplist, function (event) {
                shoplistEdit(event.data);
            })
            .children('strong')
            .text(shoplist.name)
    });
}

function shoplistDelete(shoplist) {
    restShoplistDelete(shoplist)
        .done(function () {
            $('#shoplists').data('changed', true);
            shoplistsShow();
        });
}

function shoplistEdit(shoplist) {
    ajaxFetchJson(
        shoplist.buydetails,
        function (jsonData) {
            //$('#shoplist-name').text(shoplist.name);
            $('#location-hint').text("Items in " + shoplist.name);
            $('#buydetails')
                .data('shoplist', shoplist)
                .data('buydetails', jsonData);
            buydetailsPopulateHtml();
            viewMode_buydetails();
        });
}

function buydetailsPopulateHtml() {

    var $listGroup = $('#buydetails-form > div.list-group');
    $($listGroup)
        .children('.list-group-item:not(.template)')
        .remove();

    $('#buydetails').data('buydetails').
    forEach(function (buydetail, index) {

        var $listItem =
            $($listGroup)
            .children('.list-group-item.template')
            .clone(true, true)
            .appendTo($listGroup);
        $listItem
            .removeClass('template')
            .removeClass('hidden')
            .data('buydetail', buydetail);
        $listItem.children('input.checkbox')
            .prop('checked', buydetail.picked)
            .change(onBuydetailPickedChange);

        $listItem.children('span').children('strong').text(buydetail.buyable_name);
        $listItem.children('span').children('a').click(onBuydetailDelete);
    });
}

function onBuydetailPickedChange(event) {

    var buydetail = $(event.delegateTarget).closest('.list-group-item').data('buydetail');
    buydetail.picked = $(event.delegateTarget).prop('checked');
    restBuydetailUpdate(buydetail)
        .done(function () {
            // nothing to do here for nows
        });
}

function onBuydetailDelete(event) {

    var buydetail = $(event.delegateTarget).closest('.list-group-item').data('buydetail');
    restBuydetailDelete(buydetail)
        .done(function () {
            shoplistEdit($('#buydetails').data('shoplist'));
        });
}

function viewMode_shoplists() {
    $('body > div.container-fluid').addClass('hidden');
    $('#shoplists').removeClass('hidden');

    $('.navbar-right').children().addClass('hidden');
    $('#shoplists-nav').removeClass('hidden');
}

function viewMode_buydetails() {
    $('body > div.container-fluid').addClass('hidden');
    $('#buydetails').removeClass('hidden');

    $('.navbar-right').children().addClass('hidden');
    $('#buydetails-nav').removeClass('hidden');
}
