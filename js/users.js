var currentMaximumConnections = 1;
var currentProfilePicture = "";
var users = [];

$(document).ready(function() {
    getUsers();
});

function getUsers() {
    $("#users").find("*").remove();
    users = [];
    showProgress("Memuat pengguna");
    // Get users
    firebase.database().ref("users").once("value").then(function(snapshot) {
        var i = 1;
        for (var userID in snapshot.val()) {
            var user = {};
            for (var key2 in snapshot.val()[userID]) {
                var value = snapshot.val()[userID][key2];
                user[key2] = value;
            }
            user['id'] = userID;
            var position = "";
            if (user['position'] == 1) {
                position = "Pengguna";
            } else if (user['position'] == 2) {
                position = "Penjual";
            } else if (user['position'] == 3) {
                position = "Pengantar";
            }
            var name = user["name"];
            if (name == undefined) {
                name = "";
            }
            var email = user["email"];
            if (email == undefined) {
                email = "";
            }
            var password = user["password"];
            if (password == undefined) {
                password = "";
            }
            var phone = user["phone"];
            if (phone == undefined) {
                phone = "";
            }
            $("#users").append(""+
                "<tr>"+
                "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>"+i+"</div></td>"+
                "<td>"+name+"</td>"+
                "<td>"+email+"</td>"+
                "<td>"+password+"</td>"+
                "<td>"+phone+"</td>"+
                "<td>"+position+"</td>"+
                "<td><a class='edit-user link'>Ubah</a></td>"+
                "<td><a class='delete-user link'>Hapus</a></td>"+
                "</tr>"
            );
            users.push(user);
            i++;
        }
        setUserClickListener();
        hideProgress();
    });
}

function setUserClickListener() {
    $(".edit-user").on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        $("#edit-user-title").html("Ubah Pengguna");
        $("#edit-user-name").val(user["name"]);
        $("#edit-user-phone").val(user["phone"]);
        $("#edit-user-email").val(user["email"]);
        $("#edit-user-password").val(user["password"]);
        var endTime = new Date(parseInt(user["end_date"]));
        console.log("End time: "+endTime);
        var year = endTime.getFullYear();
        var month = endTime.getMonth()+1;
        if (month < 10) {
            month = "0"+month;
        }
        var day = endTime.getDate();
        console.log("Month: "+month);
        if (day < 10) {
            day = "0"+day;
        }
        $("#end-time").val(year+"-"+month+"-"+day);
        if (user["profile_picture_url"] != "") {
            $("#edit-user-profile-picture").attr("src", user["profile_picture_url"]);
        }
        $("#edit-user-container").css("display", "flex").hide().fadeIn(300);
        $("#edit-user-ok").html("Ubah").unbind().on("click", function() {
            var name = $("#edit-user-name").val().trim();
            var phone = $("#edit-user-phone").val().trim();
            var email = $("#edit-user-email").val().trim();
            var password = $("#edit-user-password").val().trim();
            if (email == "") {
                show("Mohon masukkan email");
                return;
            }
            if (password == "") {
                show("Mohon masukkan kata sandi");
                return;
            }
            showProgress("Mengubah informasi pengguna");
            firebase.database().ref("users/"+user["id"]).set({
                name: name,
                phone: phone,
                email: email,
                password: password
            }, function(error) {
                hideProgress();
                $("#edit-user-container").fadeOut(300);
                getUsers();
            });
        });
    });
    $(".delete-user").on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        $("#confirm-title").html("Hapus Pengguna");
        $("#close-confirm").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus pengguna ini?");
        $("#confirm-ok").unbind().on("click", function() {
            $("#confirm-container").hide();
            showProgress("Menghapus pengguna");
            $.ajax({
                type: 'GET',
                url: PHP_PATH+'delete-user.php',
                data: {'id': user["id"]},
                dataType: 'text',
                cache: false,
                success: function(a) {
                    firebase.database().ref("users/"+user["id"]).remove();
                    hideProgress();
                    getUsers();
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
}

function addUser() {
    currentMaximumConnections = 1;
    currentProfilePicture = "img/profile-picture.jpg";
    $("#edit-user-title").html("Tambah Pengguna");
    $("#edit-user-name").val("");
    $("#edit-user-phone").val("");
    $("#edit-user-email").val("");
    $("#edit-user-password").val("");
    $("#edit-user-container").css("display", "flex").hide().fadeIn(300);
    $("#edit-user-ok").html("Tambah").unbind().on("click", function() {
        var name = $("#edit-user-name").val().trim();
        var phone = $("#edit-user-phone").val().trim();
        var email = $("#edit-user-email").val().trim();
        var password = $("#edit-user-password").val().trim();
        if (email == "") {
            show("Mohon masukkan email");
            return;
        }
        if (password == "") {
            show("Mohon masukkan kata sandi");
            return;
        }
        showProgress("Menambah pengguna");
        var userID = generateUUID();
        firebase.database().ref("users/"+userID).set({
            name: name,
            email: email,
            password: password,
            phone: phone
        }, function(error) {
            $("#edit-user-container").fadeOut(300);
            hideProgress();
            getUsers();
        });
    });
}

function closeEditUserDialog() {
    $("#edit-user-container").fadeOut(300);
}

function generateRandomUsername() {
    var userName = generateRandomID(14);
    $("#edit-user-username").val(userName);
}

function increaseMaxConn() {
    currentMaximumConnections++;
    $("#maximum-connections").val(currentMaximumConnections);
}

function decreaseMaxConn() {
    if (currentMaximumConnections > 1) {
        currentMaximumConnections--;
    }
    $("#maximum-connections").val(currentMaximumConnections);
}

function selectProfilePicture() {
    $("#edit-user-select-profile-picture").on("change", function() {
        var fr = new FileReader();
        fr.onload = function() {
            $("#edit-user-profile-picture").attr("src", fr.result);
        };
        fr.readAsDataURL($(this).prop("files")[0]);
    });
    $("#edit-user-select-profile-picture").click();
}