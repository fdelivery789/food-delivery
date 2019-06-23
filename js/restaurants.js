var restaurants = [];
var latestMarker = null;
var map = null;
var platform;
var mapTypes;
var currentLatitude = 0;
var currentLongitude = 0;
var timeout;

$(document).ready(function() {
    platform = new H.service.Platform({
        app_id: HERE_APP_ID,
        app_code: HERE_APP_CODE
    });
    mapTypes = platform.createDefaultLayers();
    getRestaurants();
});

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
        currentLatitude = restaurant["latitude"];
        currentLongitude = restaurant["longitude"];
        $("#edit-restaurant-title").html("Ubah Informasi Restoran");
        $("#edit-restaurant-name").val(restaurant["name"]);
        $("#edit-restaurant-address").val(restaurant["address"]);
        $("#edit-restaurant-container").css("display", "flex").hide().fadeIn(300);
        if (map != null) {
            $("#map-container").remove(map);
        }
        map = new H.Map(document.getElementById("map"), mapTypes.normal.map, {
            zoom: 10,
            center: {lat: restaurant["latitude"], lng: restaurant["longitude"]}
        });
        var icon = new H.map.Icon("http://fdelivery.xyz/img/map.png");
        latestMarker = new H.map.Marker({lat: restaurant["latitude"], lng: restaurant["longitude"]}, {icon: icon});
        map.addObject(latestMarker);
        timeout = null;
        setMapKeyListener();
        $("#edit-restaurant-ok").html("Simpan").unbind().on("click", function() {
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
            updates["restaurants/"+restaurant["id"]+"/latitude"] = currentLatitude;
            updates["restaurants/"+restaurant["id"]+"/longitude"] = currentLongitude;
            firebase.database().ref().update(updates, function(error) {
                $("#edit-restaurant-container").fadeOut(300);
                getRestaurants();
            });
        });
    });
}

function setMapKeyListener() {
    $("#edit-restaurant-map").val("").on("keyup", function() {
        var field = this;
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            var value = $(field).val();
            console.log("Searching for location: "+value);
            $.ajax({
                type: 'GET',
                url: "http://autocomplete.geocoder.api.here.com/6.2/suggest.json?app_id="+HERE_APP_ID+"&app_code="+HERE_APP_CODE+"&query="+value,
                dataType: 'text',
                cache: false,
                success: function(response) {
                    console.log("Response: "+response);
                    var suggestions = JSON.parse(response)["suggestions"];
                    if (suggestions.length > 0) {
                        var suggestion = suggestions[0];
                        var label = suggestion["label"];
                        var locationId = suggestion["locationId"];
                        console.log("Location ID: "+locationId);
                        $.ajax({
                            type: 'GET',
                            url: 'http://geocoder.api.here.com/6.2/geocode.json?locationid='+locationId+'&jsonattributes=1&gen=9&app_id='+HERE_APP_ID+'&app_code='+HERE_APP_CODE,
                            dataType: 'text',
                            cache: false,
                            success: function(response) {
                                console.log(response);
                                var obj = JSON.parse(response)["response"];
                                var views = obj["view"];
                                var view = views[0];
                                var results = view["result"];
                                var result = results[0];
                                var location = result["location"];
                                var displayPosition = location["displayPosition"];
                                var latitude = displayPosition["latitude"];
                                var longitude = displayPosition["longitude"];
                                currentLatitude = latitude;
                                currentLongitude = longitude;
                                map.removeObject(latestMarker);
                                var icon = new H.map.Icon("http://fdelivery.xyz/img/map.png");
                                latestMarker = new H.map.Marker({lat: latitude, lng: longitude}, {icon: icon});
                                map.addObject(latestMarker);
                                map.setCenter({lat: latitude, lng: longitude});
                            }
                        });
                    }
                }
            });
        }, 2000);
    });
}

function closeEditRestaurantDialog() {
    $("#edit-restaurant-container").fadeOut(300);
}

function addRestaurant() {
    $("#edit-restaurant-title").html("Tambah Restoran");
    $("#edit-restaurant-name").val("");
    $("#edit-restaurant-address").val("");
    $("#edit-restaurant-map").val("");
    if (map != null) {
        $("#map-container").remove(map);
    }
    map = new H.Map(document.getElementById("map"), mapTypes.normal.map, {
        zoom: 10,
        center: {lat: -6.229728, lng: 106.6894287}
    });
    var icon = new H.map.Icon("http://fdelivery.xyz/img/map.png");
    latestMarker = new H.map.Marker({lat: -6.229728, lng: 106.6894287}, {icon: icon});
    map.addObject(latestMarker);
    timeout = null;
    setMapKeyListener();
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
        var restaurantID = generateUUID();
        firebase.database().ref("restaurants/"+restaurantID).set({
            name: name,
            address: address,
            latitude: currentLatitude,
            longitude: currentLongitude
        });
        $("#edit-restaurant-container").fadeOut(300);
        getRestaurants();
    });
    $("#edit-restaurant-container").css("display", "flex").hide().fadeIn(300);
}