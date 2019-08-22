var orders;
var platform;
//var hereMap;
var selectedLatitude;
var selectedLongitude;
var currentLatitude;
var currentLongitude;
var map;

$(document).ready(function () {
    getOrders();
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]),
            zoom: 4
        })
    });
    //-6.229728,106.6894287
    /*hereMap = $('#map').jHERE({
        enable: ['behavior'],
        center: [0, 0],
        zoom: 8
    });*/
});

function getOrders() {
    $("#orders").find("*").remove();
    orders = [];
    showProgress("Memuat daftar pesanan");
    $.ajax({
        type: 'GET',
        url: PHP_PATH + 'get-orders.php',
        dataType: 'text',
        cache: false,
        success: function (response) {
            var ordersJSON = JSON.parse(response);
            for (var i = 0; i < ordersJSON.length; i++) {
                let order = ordersJSON[i];
                orders.push(order);
            }
            let order = orders[0];
            var userID = order["buyer_id"];
            var fd = new FormData();
            fd.append("user_id", userID);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'get-user-info.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function (response) {
                    var user = JSON.parse(response);
                    order["user"] = user;
                    var sellerID = order["seller_id"];
                    var fd = new FormData();
                    fd.append("user_id", sellerID);
                    $.ajax({
                        type: 'POST',
                        url: PHP_PATH + 'get-user-info.php',
                        data: fd,
                        processData: false,
                        contentType: false,
                        cache: false,
                        success: function (response) {
                            var seller = JSON.parse(response);
                            order["seller"] = seller;
                            var driverID = order["driver_id"];
                            var fd = new FormData();
                            fd.append("user_id", driverID);
                            $.ajax({
                                type: 'POST',
                                url: PHP_PATH + 'get-user-info.php',
                                data: fd,
                                processData: false,
                                contentType: false,
                                cache: false,
                                success: function (response) {
                                    var driver = JSON.parse(response);
                                    order["driver"] = driver;
                                    displayOrder(user, 0);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function displayOrder(user, looper) {
    if (looper >= orders.length) {
        hideProgress();
        return;
    }
    var order = orders[looper];
    var fd = new FormData();
    fd.append("user_id", order["buyer_id"]);
    $.ajax({
        type: 'POST',
        url: PHP_PATH + 'get-user-info.php',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
        success: function (response) {
            var buyerInfo = JSON.parse(response);
            var buyerEmail = buyerInfo["email"];
            var fd = new FormData();
            fd.append("user_id", order["seller_id"]);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'get-user-info.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function (response) {
                    var sellerInfo = JSON.parse(response);
                    var sellerEmail = sellerInfo["email"];
                    $("#orders").append("" +
                        "<tr>" +
                        "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (looper + 1) + "</div></td>" +
                        "<td>" + buyerEmail + " &#8594; " + sellerEmail + "</td>" +
                        "<td>" + order["total_items"] + "</td>" +
                        "<td><a class='view-order link'>Lihat</a></td>" +
                        "<td><a class='delete-order link'>Hapus</a></td>" +
                        "</tr>"
                    );
                    setOrderClickListener();
                    displayOrder(user, looper+1);
                }
            });
        }
    });
}

function setOrderClickListener() {
    $(".view-order").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var order = orders[index];
        var fd = new FormData();
        fd.append("user_id", order["buyer_id"]);
        $.ajax({
            type: 'POST',
            url: PHP_PATH + 'get-user-info.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (response) {
                var buyerInfo = JSON.parse(response);
                $("#view-order-customer-phone").val(buyerInfo["phone"]);
                $("#view-order-customer-email").val(buyerInfo["email"]);
            }
        });
        fd = new FormData();
        fd.append("user_id", order["seller_id"]);
        $.ajax({
            type: 'POST',
            url: PHP_PATH + 'get-user-info.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (response) {
                var sellerInfo = JSON.parse(response);
                $("#view-order-seller-phone").val(sellerInfo["phone"]);
                $("#view-order-seller-email").val(sellerInfo["email"]);
            }
        });
        fd = new FormData();
        fd.append("user_id", order["driver_id"]);
        $.ajax({
            type: 'POST',
            url: PHP_PATH + 'get-user-info.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (response) {
                var driverInfo = JSON.parse(response);
                $("#view-order-driver-phone").val(driverInfo["phone"]);
                $("#view-order-driver-email").val(driverInfo["email"]);
            }
        });
        $("#view-order-fee").val("Rp" + formatMoney(parseInt(order["fee"])) + ",-");
        $("#view-order-ok").unbind().on("click", function () {
            $("#view-order-container").fadeOut(300);
        });
        $("#view-order-cancel").unbind().on("click", function () {
            $("#view-order-container").fadeOut(300);
        });
        $("#view-order-container").css("display", "flex").hide().fadeIn(300);
        var driver = order["driver"];
        firebase.database().ref("users/" + driver["firebase_user_id"] + "").once("value").then(function (snapshot) {
            var driver = {};
            for (var key in snapshot.val()) {
                driver[key] = snapshot.val()[key];
            }
            var latitude = parseFloat(driver["latitude"]);
            var longitude = parseFloat(driver["longitude"]);
            map.getView().setCenter(ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'))
            map.getView().setZoom(15);
            /*hereMap.jHERE("nomarkers");
            hereMap.jHERE("center", [latitude, longitude]);
            hereMap.jHERE("marker", [latitude, longitude], {
                icon: 'https://' + HOST + '/img/map.png'
            });*/
        });
    });
    $(".delete-order").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var order = orders[index];
        $("#confirm-title").html("Hapus Pesanan");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus pemesanan ini?");
        $("#confirm-ok").unbind().on("click", function () {
            $("#confirm-container").hide();
            showProgress("Menghapus pemesanan");
            var fd = new FormData();
            fd.append("id", order["id"]);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'delete-order.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function (response) {
                    show("Pesanan dihapus");
                    hideProgress();
                    getOrders();
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function () {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
}

function closeViewOrderDialog() {
    $("#view-order-container").fadeOut(300);
}
