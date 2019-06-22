var orders;
var map;

$(document).ready(function() {
    getOrders();
});

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -6.2841019, lng: 106.7320382},
        zoom: 8
    });
}

function getOrders() {
    $("#orders").find("*").remove();
    orders = [];
    showProgress("Memuat daftar pesanan");
    firebase.database().ref("users").orderByChild("new_order").equalTo(1).once("value").then(function(snapshot) {
        var i = 1;
        for (var userID in snapshot.val()) {
            var user = {};
            for (var key in snapshot.val()[userID]) {
                user[key] = snapshot.val()[userID][key];
            }
            const buyerID = user["new_order_buyer_id"];
            const sellerID = user["new_order_seller_id"];
            var order = {
                buyerID: buyerID,
                sellerID: sellerID,
                driverID: userID
            };
            orders.push(order);
            const number = i;
            firebase.database().ref("users/"+buyerID+"/email").once("value").then(function(snapshot) {
                var buyerEmail = snapshot.val();
                firebase.database().ref("users/"+sellerID+"/email").once("value").then(function(snapshot) {
                    var sellerEmail = snapshot.val();
                    $("#orders").append(""+
                        "<tr>"+
                        "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>"+number+"</div></td>"+
                        "<td>"+sellerEmail+" &#8594; "+buyerEmail+"</td>"+
                        "<td>"+user["new_order_total_items"]+"</td>"+
                        "<td><a class='view-order link'>Lihat</a></td>"+
                        "<td><a class='delete-order link'>Hapus</a></td>"+
                        "</tr>"
                    );
                    setOrderClickListener();
                });
            });
            i++;
        }
        hideProgress();
    });
}

function setOrderClickListener() {
    $(".view-order").unbind().on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var order = orders[index];
        firebase.database().ref("users/"+order["buyerID"]+"/phone").once("value").then(function(snapshot) {
            var buyerPhone = "-";
            if (snapshot != null && snapshot.exists()) {
                buyerPhone = snapshot.val().trim();
                if (buyerPhone == "") {
                    buyerPhone = "-";
                }
            }
            $("#view-order-customer-phone").html(buyerPhone);
            firebase.database().ref("users/"+order["sellerID"]+"/phone").once("value").then(function(snapshot) {
                var sellerPhone = "-";
                if (snapshot != null && snapshot.exists()) {
                    sellerPhone = snapshot.val().trim();
                    if (sellerPhone == "") {
                        sellerPhone = "-";
                    }
                }
                $("#view-order-seller-phone").html(sellerPhone);
                firebase.database().ref("users/"+order["driverID"]+"/phone").once("value").then(function(snapshot) {
                    var driverPhone = "-";
                    if (snapshot != null && snapshot.exists()) {
                        driverPhone = snapshot.val().trim();
                        if (driverPhone == "") {
                            driverPhone = "-";
                        }
                    }
                    $("#view-order-driver-phone").html(driverPhone);
                    firebase.database().ref("users/"+order["driverID"]+"/new_order_fee").once("value").then(function(snapshot) {
                        $("#view-order-fee").html("Rp"+formatMoney(snapshot.val())+",-");
                    });
                });
            });
        });
        $("#view-order-ok").unbind().on("click", function() {
            $("#view-order-container").fadeOut(300);
        });
        $("#view-order-container").css("display", "flex").hide().fadeIn(300);
    });
    $(".delete-order").unbind().on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var order = orders[index];
        $("#confirm-title").html("Hapus Riwayat Pembayaran");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus riwayat pembayaran ini?");
        $("#confirm-ok").unbind().on("click", function() {
            $("#confirm-container").hide();
            showProgress("Menghapus riwayat");
            $.ajax({
                type: 'GET',
                url: PHP_PATH+'delete-order.php',
                data: {'id': order["id"]},
                dataType: 'text',
                cache: false,
                success: function(a) {
                    hideProgress();
                    show("Riwayat pembayaran dihapus");
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
}