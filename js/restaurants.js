var restaurants = [];
var latestMarker = null;
var map;

$(document).ready(function() {
    getRestaurants();
});

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -6.229728, lng: 106.6894287},
        zoom: 8
    });
}

function getRestaurants() {
    $("#restaurants").find("*").remove();
    restaurants = [];
    showProgress("Memuat daftar restoran");
    firebase.database().ref("restaurants").once("value").then(function(snapshot) {
        var i = 1;
        for (var restaurantID in snapshot.val()) {
            var restaurant = {};
            for (var key in snapshot.val()[restaurantID]) {
                restaurant[key] = snapshot.val()[restaurantID][key];
            }
            restaurant["id"] = restaurantID;
            restaurants.push(restaurant);
            var address = restaurant["address"];
            if (address != null && address != undefined) {
                if (address.length > 56) {
                    address = address.substr(0, 56);
                    address += "...";
                }
            } else {
                address = "";
            }
            $("#restaurants").append(""+
                "<tr>"+
                "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>"+i+"</div></td>"+
                "<td>"+restaurant["name"]+"</td>"+
                "<td>"+address+"</td>"+
                "<td><a class='edit-restaurant link'>Ubah</a></td>"+
                "<td><a class='delete-restaurant link'>Hapus</a></td>"+
                "</tr>"
            );
            i++;
        }
        setRestaurantClickListener();
        hideProgress();
    });
}

function setRestaurantClickListener() {
    $(".edit-restaurant").unbind().on("click", function() {
        var td = $(this).parent();
        var tr = td.parent();
        var index = tr.parent().children().index(tr);
        var restaurant = restaurants[index];
        $("#edit-restaurant-map").val("");
        $("#edit-restaurant-title").html("Ubah Informasi Restoran");
        $("#edit-restaurant-name").val(restaurant["name"]);
        $("#edit-restaurant-address").val(restaurant["address"]);
        $("#edit-restaurant-container").css("display", "flex").hide().fadeIn(300);
        var timeout = null;
        $("#edit-restaurant-map").on("keyup", function() {
            var field = this;
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                var value = $(field).val();
                $.ajax({
                    type: 'GET',
                    url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+value+'&key='+API_KEY,
                    dataType: 'text',
                    cache: false,
                    success: function(response) {
                        console.log("Response: "+response);
                        var obj = JSON.parse(response);
                        var results = obj["results"];
                        var result = results[0];
                        var geometry = result["geometry"];
                        var location = geometry["location"];
                        var lat = location["lat"];
                        var lng = location["lng"];
                        console.log("Latitude: "+lat+", longitude: "+lng);
                        var myLoc = new google.maps.LatLng(lat, lng);
                        map.panTo(myLoc);
                        if (latestMarker != null) {
                            latestMarker.setMap(null);
                        }
                        latestMarker = new google.maps.Marker({
                            position: myLoc,
                            map: map,
                            title: 'Lokasi Restoran'
                        });
                    }
                });
            }, 1000);
        });
        $("#edit-restaurant-ok").html("Simpan");
        $("#edit-restaurant-ok").unbind().on("click", function() {
            var name = $("#edit-restaurant-name").val().trim();
            var address = $("#edit-restaurant-address").val().trim();
            if (name == "") {
                show("Mohon masukkan nama restoran");
                return;
            }
            if (address == "") {
                show("Mohon masukkan alamat restoran");
                return;
            }
            showProgress("Mengubah informasi restoran");
            var updates = {};
            updates["restaurants/"+restaurant["id"]+"/name"] = name;
            updates["restaurants/"+restaurant["id"]+"/address"] = address;
            firebase.database().ref().update(updates, function(error) {
                $("#edit-restaurant-container").fadeOut(300);
                getRestaurants();
            });
        });
    });
}