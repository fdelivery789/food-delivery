var restaurants = [];
var latestMarker = null;
var map = null;
var currentLatitude = 0;
var currentLongitude = 0;
var timeout;
var sellers = [];
var selectedEmail = null;
var emailSearchResults = [];
var foods = [];
var currentRestaurant;
var foodImgFile = null;
var selectedLatitude = 0;
var selectedLongitude = 0;
//var hereMap = null;
var sources = [];

$(document).ready(function () {
    map = new ol.Map({
        target: 'edit-restaurant-map',
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
    $("#select-email").unbind().on("click", function () {
        if ($("#emails-container").css("display") == "flex") {
            $("#emails-container").css("display", "none");
        } else {
            $("#emails-container").css("display", "flex");
        }
    });
    $("#email").on("input", function () {
        var email = $("#email").val().toLowerCase();
        $("#emails").find("*").remove();
        emailSearchResults = [];
        for (var i = 0; i < sellers.length; i++) {
            if (email != "" && sellers[i]["email"].toLowerCase().includes(email)) {
                $("#emails").append("" +
                    "<div class='email'>" +
                    "" + sellers[i]["email"] +
                    "</div>");
                emailSearchResults.push(sellers[i]);
            }
        }
        setEmailClickListener();
    });
    getRestaurants();
});

function setEmailClickListener() {
    $(".email").unbind().on("click", function () {
        var index = $(this).parent().children().index(this);
        var seller = emailSearchResults[index];
        $("#selected-email").html(seller["email"]);
        $("#email").val(seller["email"]);
        $("#emails-container").css("display", "none");
        $("#emails").find("*").remove();
        selectedEmail = seller["email"];
    });
}

function getRestaurants() {
    $("#restaurants").find("*").remove();
    restaurants = [];
    sellers = [];
    showProgress("Memuat daftar restoran");
    firebase.database().ref("restaurants").once("value").then(function (snapshot) {
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
            $("#restaurants").append("" +
                "<tr>" +
                "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + i + "</div></td>" +
                "<td>" + restaurant["name"] + "</td>" +
                "<td>" + address + "</td>" +
                "<td><a class='view-foods link'>Lihat</a></td>" +
                "<td><a class='edit-restaurant link'>Ubah</a></td>" +
                "<td><a class='delete-restaurant link'>Hapus</a></td>" +
                "</tr>"
            );
            i++;
        }
        firebase.database().ref("users").orderByChild("position").equalTo(2).once("value").then(function (snapshot) {
            for (var userID in snapshot.val()) {
                var user = {};
                for (var key in snapshot.val()[userID]) {
                    user[key] = snapshot.val()[userID][key];
                }
                user["id"] = userID;
                sellers.push(user);
            }
            setRestaurantClickListener();
            hideProgress();
        });
    });
}

function setRestaurantClickListener() {
    $(".edit-restaurant").unbind().on("click", function () {
        var td = $(this).parent();
        var tr = td.parent();
        var index = tr.parent().children().index(tr);
        var restaurant = restaurants[index];
        currentLatitude = restaurant["latitude"];
        currentLongitude = restaurant["longitude"];
        $("#edit-restaurant-title").html("Ubah Informasi Restoran");
        $("#edit-restaurant-name").val(restaurant["name"]);
        $("#edit-restaurant-address").val(restaurant["address"]);
        var latitude = parseFloat(restaurant["latitude"]);
        var longitude = parseFloat(restaurant["longitude"]);
        if (latitude == 0) {
            latitude = -6.229728;
        }
        if (longitude == 0) {
            longitude = 106.6894287;
        }
        currentLatitude = latitude;
        currentLongitude = longitude;
        selectedLatitude = latitude;
        selectedLongitude = longitude;
        map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));
        map.on("click", function (evt) {
            clearMarkers();
            var coord = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            var lng = coord[0];
            var lat = coord[1];
            selectedLatitude = lat;
            selectedLongitude = lng;
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([parseFloat(lng), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857')),
                    })]
                }),
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 0.5],
                        anchorXUnits: "fraction",
                        anchorYUnits: "fraction",
                        src: "https://" + HOST + "/img/map_clicked.png"
                    })
                })
            });
            map.addLayer(vectorLayer);
            sources.push(vectorLayer.getSource());
        });
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.transform([parseFloat(longitude), parseFloat(latitude)], 'EPSG:4326', 'EPSG:3857')),
                })]
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    anchorXUnits: "fraction",
                    anchorYUnits: "fraction",
                    src: "https://" + HOST + "/img/map.png"
                })
            })
        });
        map.addLayer(vectorLayer);
        sources.push(vectorLayer.getSource());
        /*if (hereMap == null) {
            hereMap = $('#edit-restaurant-map').jHERE({
                enable: ['behavior'],
                center: [0, 0],
                zoom: 8
            }).on("mapclick", function(event) {
                selectedLatitude = event.geo.latitude;
                selectedLongitude = event.geo.longitude;
                $("#edit-restaurant-map").jHERE("nomarkers");
                $("#edit-restaurant-map").jHERE("marker", [currentLatitude, currentLongitude], {
                    icon: 'https://'+HOST+'/img/map.png'
                });
                $("#edit-restaurant-map").jHERE("marker", [selectedLatitude, selectedLongitude], {
                    icon: 'https://'+HOST+'/img/map_clicked.png',
                    anchor: {x: 15, y: 35}
                });
            });
        }
        hereMap.jHERE("nomarkers");
        hereMap.jHERE("center", [latitude, longitude]);
        hereMap.jHERE("marker", [latitude, longitude], {
            icon: 'https://'+HOST+'/img/map.png'
        });*/
        $("#edit-restaurant-container").css("display", "flex").hide().fadeIn(300);
        /*if (map != null) {
            $("#map-container").remove(map);
        }
        map = new H.Map(document.getElementById("map"), mapTypes.normal.map, {
            zoom: 10,
            center: {lat: restaurant["latitude"], lng: restaurant["longitude"]}
        });
        var icon = new H.map.Icon("https://fdelivery.xyz/img/map.png");
        latestMarker = new H.map.Marker({lat: restaurant["latitude"], lng: restaurant["longitude"]}, {icon: icon});
        map.addObject(latestMarker);*/
        timeout = null;
        setMapKeyListener();
        $("#edit-restaurant-ok").html("Simpan").unbind().on("click", function () {
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
            updates["restaurants/" + restaurant["id"] + "/name"] = name;
            updates["restaurants/" + restaurant["id"] + "/address"] = address;
            updates["restaurants/" + restaurant["id"] + "/latitude"] = selectedLatitude;
            updates["restaurants/" + restaurant["id"] + "/longitude"] = selectedLongitude;
            clearMarkers();
            firebase.database().ref().update(updates, function (error) {
                $("#edit-restaurant-container").fadeOut(300);
                getRestaurants();
            });
        });
    });
    $(".delete-restaurant").unbind().on("click", function () {
        var td = $(this).parent();
        var tr = td.parent();
        var index = tr.parent().children().index(tr);
        var restaurant = restaurants[index];
        $("#confirm-title").html("Hapus Restoran");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus restoran ini?");
        $("#confirm-ok").unbind().on("click", function () {
            $("#confirm-container").fadeOut(300);
            showProgress("Menghapus restoran");
            firebase.database().ref("restaurants/" + restaurant["id"]).remove();
            getRestaurants();
        });
        $("#confirm-cancel").unbind().on("click", function () {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
    $(".view-foods").unbind().on("click", function () {
        var td = $(this).parent();
        var tr = td.parent();
        var index = $("#restaurants").children().index(tr);
        currentRestaurant = restaurants[index];
        getFoods();
    });
}

function getFoods() {
    foods = [];
    $("#foods").find("*").remove();
    var restaurant = currentRestaurant;
    var restaurantID = restaurant["id"];
    showProgress("Memuat daftar makanan");
    firebase.database().ref("restaurants/" + restaurantID + "/foods").once("value").then(function (snapshot) {
        for (var foodID in snapshot.val()) {
            let food = {};
            for (var key in snapshot.val()[foodID]) {
                food[key] = snapshot.val()[foodID][key];
            }
            food["id"] = foodID;
            foods.push(food);
            let imgURL = food["img"];
            $.ajax({
                url: imgURL,
                type: 'HEAD',
                error: function () {
                    imgURL = "https://" + HOST + "/img/food_placeholder.png";
                    $("#foods").append("" +
                        "<div class='food' style='margin-top: 3px; margin-bottom: 3px; position: relative; display: flex; flex-flow: row nowrap; align-items: center;'>" +
                        "<img src='" + imgURL + "' width='40px' height='40px' style='margin-left: 10px;'>" +
                        "<div style='display: flex; flex-flow: column nowrap; margin-left: 10px;'>" +
                        "<div class='food-name' style='color: black; font-size: 15px;'><b>" + food["name"] + "</b></div>" +
                        "<div class='food-price' style='color: black; font-size: 12px; margin-top: -8px;'>Rp " + formatMoney(parseInt(food["price"])) + ",-</div>" +
                        "</div>" +
                        "<div style='position: absolute; top: 0; right: 0; height: 100%; display: flex; justify-content: center; align-items: center; margin-right: 10px;'>" +
                        "<div class='change-food' style='color: black;'>Ubah</div>" +
                        "</div>" +
                        "</div>");
                    setChangeFoodClickListener();
                },
                success: function () {
                    $("#foods").append("" +
                        "<div class='food' style='margin-top: 3px; margin-bottom: 3px; position: relative; display: flex; flex-flow: row nowrap; align-items: center;'>" +
                        "<img src='" + imgURL + "' width='40px' height='40px' style='margin-left: 10px;'>" +
                        "<div style='display: flex; flex-flow: column nowrap; margin-left: 10px;'>" +
                        "<div class='food-name' style='color: black; font-size: 15px;'><b>" + food["name"] + "</b></div>" +
                        "<div class='food-price' style='color: black; font-size: 12px; margin-top: -8px;'>Rp " + formatMoney(parseInt(food["price"])) + ",-</div>" +
                        "</div>" +
                        "<div style='position: absolute; top: 0; right: 0; height: 100%; display: flex; justify-content: center; align-items: center; margin-right: 10px;'>" +
                        "<div class='change-food' style='color: black;'>Ubah</div>" +
                        "</div>" +
                        "</div>");
                    setChangeFoodClickListener();
                }
            });
        }
        if (foods.length == 0) {
            $("#foods").css("display", "none");
            $("#no-food-container").css("display", "flex");
        } else {
            $("#foods").css("display", "flex");
            $("#no-food-container").css("display", "none");
        }
        $("#view-foods-container").css("display", "flex").hide().fadeIn(300);
        $("#view-foods-add-food").unbind().on("click", function () {
            addFood();
        });
        $("#view-food-ok").unbind().on("click", function () {
            $("#view-foods-container").fadeOut(300);
        });
        setFoodClickListener();
        hideProgress();
    });
}

function clearMarkers() {
    for (var i = 0; i < sources.length; i++) {
        sources[i].clear();
    }
}

function addFood() {
    $("#add-food-title").html("Tambah Makanan");
    $("#add-food-name").val("");
    $("#add-food-price").val("");
    $("#add-food-img").attr("src", "https://" + HOST + "/img/food_placeholder.png");
    $("#add-food-container").css("display", "flex").hide().fadeIn(300);
    $("#add-food-cancel").unbind().on("click", function () {
        $("#add-food-container").fadeOut(300);
    });
    foodImgFile = null;
    $("#add-food-add").html("Tambah").unbind().on("click", function () {
        var name = $("#add-food-name").val().trim();
        var priceText = $("#add-food-price").val().trim();
        if (name == "") {
            show("Mohon masukkan nama");
            return;
        }
        if (priceText == "") {
            show("Mohon masukkan harga");
            return;
        }
        var price = parseInt(priceText);
        if (price == 0) {
            show("Mohon masukkan harga lebih dari 0");
            return;
        }
        showProgress("Menambah makanan");
        var foodID = generateUUID();
        if (foodImgFile != null) {
            let imgFileName = generateUUID() + ".jpg";
            let fd = new FormData();
            fd.append("file", foodImgFile);
            fd.append("file_name", imgFileName);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'upload-image.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function (response) {
                    firebase.database().ref("restaurants/" + currentRestaurant["id"] + "/foods/" + foodID).set({
                        name: name,
                        price: price,
                        img: 'https://' + HOST + '/userdata/images/' + imgFileName
                    }, function () {
                        hideProgress();
                        $("#add-food-container").fadeOut(300);
                        addFoodToList(name, price, 'https://' + HOST + '/userdata/images/' + imgFileName);
                    });
                }
            });
        } else {
            firebase.database().ref("restaurants/" + currentRestaurant["id"] + "/foods/" + foodID).set({
                name: name,
                price: price,
                img: ''
            }, function () {
                hideProgress();
                $("#add-food-container").fadeOut(300);
                addFoodToList(name, price, 'https://' + HOST + '/img/food_placeholder.png');
            });
        }
    });
}

function addFoodToList(name, price, imgURL) {
    $("#foods").append("" +
        "<div class='food' style='margin-top: 3px; margin-bottom: 3px; position: relative; display: flex; flex-flow: row nowrap; align-items: center;'>" +
        "<img src='" + imgURL + "' width='40px' height='40px' style='margin-left: 10px;'>" +
        "<div style='display: flex; flex-flow: column nowrap; margin-left: 10px;'>" +
        "<div class='food-name' style='color: black; font-size: 15px;'><b>" + name + "</b></div>" +
        "<div class='food-price' style='color: black; font-size: 12px; margin-top: -8px;'>Rp " + price + ",-</div>" +
        "</div>" +
        "<div style='position: absolute; top: 0; right: 0; height: 100%; display: flex; justify-content: center; align-items: center; margin-right: 10px;'>" +
        "<div class='change-food' style='color: black;'>Ubah</div>" +
        "</div>" +
        "</div>");
    setChangeFoodClickListener();
}

function setChangeFoodClickListener() {
    $(".change-food").unbind().on("click", function () {
        var div = $(this).parent().parent();
        var index = $("#foods").children().index(div);
        var food = foods[index];
        $("#add-food-name").val(food["name"]);
        $("#add-food-price").val(food["price"]);
        $("#add-food-img").attr("src", food["img"]);
        $("#add-food-add").html("Simpan").unbind().on("click", function () {
            var name = $("#add-food-name").val().trim();
            var priceText = $("#add-food-price").val().trim();
            if (name == "") {
                show("Mohon masukkan nama");
                return;
            }
            if (priceText == "") {
                show("Mohon masukkan harga");
                return;
            }
            var price = parseInt(priceText);
            showProgress("Menyimpan info makanan");
            if (foodImgFile != null) {
                let imgFileName = generateUUID() + ".jpg";
                let fd = new FormData();
                fd.append("file", foodImgFile);
                fd.append("file_name", imgFileName);
                console.log("Uploading image... " + imgFileName);
                $.ajax({
                    type: 'POST',
                    url: PHP_PATH + 'upload-image.php',
                    data: fd,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function (response) {
                        console.log("Uploaded image: " + imgFileName);
                        var updates = {};
                        updates["restaurants/" + currentRestaurant["id"] + "/foods/" + food["id"] + "/name"] = name;
                        updates["restaurants/" + currentRestaurant["id"] + "/foods/" + food["id"] + "/price"] = price;
                        updates["restaurants/" + currentRestaurant["id"] + "/foods/" + food["id"] + "/img"] = 'https://' + HOST + '/userdata/images/' + imgFileName;
                        firebase.database().ref().update(updates, function (error) {
                            hideProgress();
                            $("#add-food-container").fadeOut(300);
                            getFoods();
                        });
                    }
                });
            } else {
                firebase.database().ref("restaurants/" + currentRestaurant["id"] + "/foods/" + food["id"]).set({
                    name: name,
                    price: price,
                    img: ''
                }, function () {
                    hideProgress();
                    $("#add-food-container").fadeOut(300);
                    getFoods();
                });
            }
        });
        $("#add-food-cancel").unbind().on("click", function () {
            $("#add-food-container").fadeOut(300);
        });
        $("#add-food-container").css("display", "flex").hide().fadeIn(300);
    });
}

function setFoodClickListener() {
    $(".food").mouseenter(function () {
        var index = $(this).parent().children().index(this);
        var food = foods[index];
        $("#foods").find(".food:eq(" + index + ")").find(".food-name").css("color", "#ffffff");
        $("#foods").find(".food:eq(" + index + ")").find(".food-price").css("color", "#ffffff");
    }).mouseleave(function () {
        var index = $(this).parent().children().index(this);
        var food = foods[index];
        $("#foods").find(".food-name:eq(" + index + ")").css("color", "#000000");
        $("#foods").find(".food-price:eq(" + index + ")").css("color", "#000000");
    });
}

function setMapKeyListener() {
    $("#edit-restaurant-address").on("keyup", function () {
        var field = this;
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            var value = $(field).val();
            console.log("Searching for location: " + value);
            $.ajax({
                type: 'GET',
                url: "https://autocomplete.geocoder.api.here.com/6.2/suggest.json?app_id=" + HERE_APP_ID + "&app_code=" + HERE_APP_CODE + "&query=" + value,
                dataType: 'text',
                cache: false,
                success: function (response) {
                    console.log("Response: " + response);
                    var suggestions = JSON.parse(response)["suggestions"];
                    if (suggestions.length > 0) {
                        var suggestion = suggestions[0];
                        var label = suggestion["label"];
                        var locationId = suggestion["locationId"];
                        console.log("Location ID: " + locationId);
                        $.ajax({
                            type: 'GET',
                            url: 'https://geocoder.api.here.com/6.2/geocode.json?locationid=' + locationId + '&jsonattributes=1&gen=9&app_id=' + HERE_APP_ID + '&app_code=' + HERE_APP_CODE,
                            dataType: 'text',
                            cache: false,
                            success: function (response) {
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
                                selectedLatitude = latitude;
                                selectedLongitude = longitude;
                                /*map.removeObject(latestMarker);
                                var icon = new H.map.Icon("https://fdelivery.xyz/img/map.png");
                                latestMarker = new H.map.Marker({lat: latitude, lng: longitude}, {icon: icon});
                                map.addObject(latestMarker);
                                map.setCenter({lat: latitude, lng: longitude});*/
                                clearMarkers();
                                var vectorLayer = new ol.layer.Vector({
                                    source: new ol.source.Vector({
                                        features: [new ol.Feature({
                                            geometry: new ol.geom.Point(ol.proj.transform([parseFloat(longitude), parseFloat(latitude)], 'EPSG:4326', 'EPSG:3857')),
                                        })]
                                    }),
                                    style: new ol.style.Style({
                                        image: new ol.style.Icon({
                                            anchor: [0.5, 0.5],
                                            anchorXUnits: "fraction",
                                            anchorYUnits: "fraction",
                                            src: "https://" + HOST + "/img/map_clicked.png"
                                        })
                                    })
                                });
                                map.addLayer(vectorLayer);
                                sources.push(vectorLayer.getSource());
                                map.getView().setCenter(ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'));
                                map.getView().setZoom(5);
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
    selectedEmail = null;
    $("#edit-restaurant-title").html("Tambah Restoran");
    $("#edit-restaurant-name").val("");
    $("#edit-restaurant-address").val("");
    /*$("#edit-restaurant-map").val("");
    if (map != null) {
        $("#map-container").remove(map);
    }
    map = new H.Map(document.getElementById("map"), mapTypes.normal.map, {
        zoom: 10,
        center: {lat: -6.229728, lng: 106.6894287}
    });
    var icon = new H.map.Icon("https://fdelivery.xyz/img/map.png");
    latestMarker = new H.map.Marker({lat: -6.229728, lng: 106.6894287}, {icon: icon});
    map.addObject(latestMarker);*/
    timeout = null;
    setMapKeyListener();
    $("#edit-restaurant-ok").unbind().on("click", function () {
        var name = $("#edit-restaurant-name").val().trim();
        var address = $("#edit-restaurant-address").val().trim();
        if (name == "") {
            show("Mohon masukkan nama restoran");
            return;
        }
        if (selectedEmail == null) {
            show("Mohon pilih email");
            return;
        }
        if (address == "") {
            show("Mohon masukkan alamat restoran");
            return;
        }
        showProgress("Menambah restoran");
        var restaurantID = generateUUID();
        console.log("Selected email: " + selectedEmail);
        var fd2 = new FormData();
        fd2.append("email", selectedEmail);
        $.ajax({
            type: 'POST',
            url: PHP_PATH + 'get-seller-by-email.php',
            data: fd2,
            processData: false,
            contentType: false,
            cache: false,
            success: function (response) {
                console.log("Seller info: " + response);
                var sellerInfo = JSON.parse(response);
                firebase.database().ref("restaurants/" + restaurantID).set({
                    name: name,
                    address: address,
                    latitude: currentLatitude,
                    longitude: currentLongitude,
                    seller_id: sellerInfo["id"]
                }, function () {
                    var fd = new FormData();
                    fd.append("id", restaurantID);
                    fd.append("name", name);
                    fd.append("img_url", "");
                    fd.append("latitude", currentLatitude);
                    fd.append("longitude", currentLongitude);
                    fd.append("address", address);
                    fd.append("rating", "0");
                    fd.append("seller_id", sellerInfo["id"]);
                    $.ajax({
                        type: 'POST',
                        url: PHP_PATH + 'add-restaurant.php',
                        data: fd,
                        processData: false,
                        contentType: false,
                        cache: false,
                        success: function (response) {
                            $("#edit-restaurant-container").fadeOut(300);
                            getRestaurants();
                        }
                    });
                });
            }
        });
    });
    $("#edit-restaurant-container").css("display", "flex").hide().fadeIn(300);
}

function closeViewFoodsContainer() {
    $("#view-foods-container").fadeOut(300);
}

function changeFoodPicture() {
    $("#select-food-picture").on("change", function () {
        var file = $(this).prop("files")[0];
        var fr = new FileReader();
        fr.onload = function () {
            $("#add-food-img").attr("src", fr.result);
            foodImgFile = file;
        };
        fr.readAsDataURL(file);
    });
    $("#select-food-picture").click();
}
