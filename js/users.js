var currentMaximumConnections = 1;
var currentProfilePicture = "";
var users = [];
var currentUser;
var currentUserName;
var adminID;
var adminName;

$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: PHP_PATH + 'get-admin-id.php',
        dataType: 'text',
        cache: false,
        success: function (response) {
            adminID = response;
            console.log("Admin ID: "+adminID);
            $("#message").keypress(function (e) {
                if (e.which == 13) {
                    sendMessage($("#message").val());
                    return false;
                }
            });
            firebase.database().ref("admins/"+adminID+"/new_message").on("value", function(snapshot) {
                var newMessage = parseInt(snapshot.val());
                console.log("New message: "+newMessage);
                if (newMessage == 1) {
                    // New message received
                    console.log("New message received");
                    var updates = {};
                    updates["admins/"+adminID+"/new_message"] = 0;
                    firebase.database().ref().update(updates);
                    firebase.database().ref("admins/"+adminID+"/new_message_content").once("value").then(function(snapshot) {
                        var message = snapshot.val();
                        console.log("New message content: "+message);
                        firebase.database().ref("admins/"+adminID+"/new_message_sender_id").once("value").then(function(snapshot) {
                            var senderID = snapshot.val();
                            console.log("Sender ID: "+senderID);
                            firebase.database().ref("users/"+senderID+"/name").once("value").then(function(snapshot) {
                                var senderName = snapshot.val();
                                console.log("Sender name: "+senderName);
                                $("#messages").append("" +
                                    "<div style='position: relative; width: 100%; height: 60px;'>"+
                                    "<div style='position: absolute; top: 0; right: 0; margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                                    "<div style='color: #888888; font-size: 14px;'>" + senderName + "</div>" +
                                    "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                                    "</div>"+
                                    "</div>");
                                $("#messages").scrollTop($("#messages").prop("scrollHeight"));
                            });
                        });
                    });
                }
            });
        }
    });
    getUsers();
});

function sendMessage(message) {
    $("#message").val("");
    var updates = {};
    updates["users/" + currentUser["id"] + "/new_message_content"] = message;
    firebase.database().ref().update(updates);

    updates = {};
    updates["users/" + currentUser["id"] + "/new_message_admin_id"] = adminID;
    firebase.database().ref().update(updates);

    updates = {};
    updates["users/" + currentUser["id"] + "/new_message"] = 1;
    firebase.database().ref().update(updates);

    console.log("Admin ID: " + adminID);
    firebase.database().ref("admins/" + adminID + "/name").once("value").then(function (snapshot) {
        var adminName = snapshot.val();
        var fd = new FormData();
        fd.append("message", message);
        fd.append("admin_id", adminID);
        fd.append("user_id", currentUser["id"]);
        fd.append("sender", 1);
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'send-message.php',
            data: fd,
            contentType: false,
            processData: false,
            cache: false,
            success: function(a) {
                $("#messages").append("" +
                    "<div style='margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                    "<div style='color: #888888; font-size: 14px;'>" + adminName + "</div>" +
                    "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                    "</div>");
                $("#messages").scrollTop($("#messages").prop("scrollHeight"));
            }
        });
    });
}

function getUsers() {
    $("#users").find("*").remove();
    users = [];
    showProgress("Memuat pengguna");
    // Get users
    firebase.database().ref("users").once("value").then(function (snapshot) {
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
                position = "Pelanggan";
            } else if (user['position'] == 2) {
                position = "Pengantar";
            } else if (user['position'] == 3) {
                position = "Penjual";
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
            $("#users").append("" +
                "<tr>" +
                "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + i + "</div></td>" +
                "<td>" + name + "</td>" +
                "<td>" + email + "</td>" +
                "<td>" + position + "</td>" +
                "<td><a class='send-message link'>Kirim</a></td>" +
                "<td><a class='edit-user link'>Ubah</a></td>" +
                "<td><a class='delete-user link'>Hapus</a></td>" +
                "</tr>"
            );
            users.push(user);
            i++;
        }
        setUserClickListener();
        hideProgress();
    });
}

function getMessages() {
    $("#messages").find("*").remove();
    var fd = new FormData();
    fd.append("admin_id", adminID);
    fd.append("user_id", currentUser["id"]);
    firebase.database().ref("users/"+currentUser["id"]+"/name").once("value").then(function(snapshot) {
        currentUserName = snapshot.val();
        firebase.database().ref("admins/"+adminID+"/name").once("value").then(function(snapshot) {
            adminName = snapshot.val();
            console.log("User name: "+currentUserName+", admin name: "+adminName);
            $.ajax({
                type: 'POST',
                url: PHP_PATH+'get-messages.php',
                data: fd,
                contentType: false,
                processData: false,
                cache: false,
                success: function(response) {
                    console.log("Response: "+response);
                    var messagesJSON = JSON.parse(response);
                    for (var i=0; i<messagesJSON.length; i++) {
                        var messageJSON = messagesJSON[i];
                        var message = messageJSON["message"];
                        var sender = messageJSON["sender"]; //1 = admin, 2 = user
                        if (sender == 1) { //admin
                            $("#messages").append("" +
                                "<div style='margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                                "<div style='color: #888888; font-size: 14px;'>" + adminName + "</div>" +
                                "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                                "</div>");
                            $("#messages").scrollTop($("#messages").prop("scrollHeight"));
                        } else if (sender == 2) { //user
                            $("#messages").append("" +
                                "<div style='position: relative; width: 100%; height: 60px;'>"+
                                    "<div style='position: absolute; top: 0; right: 0; margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                                        "<div style='color: #888888; font-size: 14px;'>" + currentUserName + "</div>" +
                                        "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                                    "</div>"+
                                "</div>");
                            $("#messages").scrollTop($("#messages").prop("scrollHeight"));
                        }
                    }
                }
            });
        });
    });
}

function setUserClickListener() {
    $(".send-message").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        currentUser = user;
        $("#user-name").html(user["name"]);
        $("#user-email").html(user["email"]);
        $("#chat-container").css("display", "flex").hide().fadeIn(100);
        $("#message").val("");
        getMessages();
    });
    $(".edit-user").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        $("#edit-user-title").html("Ubah Pengguna");
        $("#edit-user-name").val(user["name"]);
        $("#edit-user-phone").val(user["phone"]);
        $("#edit-user-email").val(user["email"]);
        $("#edit-user-password").val(user["password"]);
        var position = user["position"];
        if (position == 1) {
            $("#customer").prop("checked", true);
            $("#driver").prop("checked", false);
            $("#seller").prop("checked", false);
        } else if (position == 2) {
            $("#customer").prop("checked", false);
            $("#driver").prop("checked", true);
            $("#seller").prop("checked", false);
        } else if (position == 3) {
            $("#customer").prop("checked", false);
            $("#driver").prop("checked", false);
            $("#seller").prop("checked", true);
        }
        if (user["profile_picture_url"] != "") {
            $("#edit-user-profile-picture").attr("src", user["profile_picture_url"]);
        }
        $("#edit-user-container").css("display", "flex").hide().fadeIn(300);
        $("#edit-user-ok").html("Ubah").unbind().on("click", function () {
            var name = $("#edit-user-name").val().trim();
            var phone = $("#edit-user-phone").val().trim();
            var email = $("#edit-user-email").val().trim();
            var password = $("#edit-user-password").val().trim();
            var position = user["position"];
            if ($("#customer").prop("checked") == true) {
                position = 1;
            } else if ($("#driver").prop("checked") == true) {
                position = 2;
            } else if ($("#seller").prop("checked") == true) {
                position = 3;
            }
            console.log("New position: " + position);
            if (email == "") {
                show("Mohon masukkan email");
                return;
            }
            if (password == "") {
                show("Mohon masukkan kata sandi");
                return;
            }
            showProgress("Mengubah informasi pengguna");
            var updates = {};
            updates["users/" + user["id"] + "/name"] = name;
            updates["users/" + user["id"] + "/phone"] = phone;
            updates["users/" + user["id"] + "/email"] = email;
            updates["users/" + user["id"] + "/password"] = password;
            updates["users/" + user["id"] + "/position"] = position;
            firebase.database().ref().update(updates, function () {
                hideProgress();
                $("#edit-user-container").fadeOut(300);
                getUsers();
            });
        });
    });
    $(".delete-user").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        $("#confirm-title").html("Hapus Pengguna");
        $("#close-confirm").unbind().on("click", function () {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus pengguna ini?");
        $("#confirm-ok").unbind().on("click", function () {
            $("#confirm-container").hide();
            showProgress("Menghapus pengguna");
            $.ajax({
                type: 'GET',
                url: PHP_PATH + 'delete-user.php',
                data: {'id': user["id"]},
                dataType: 'text',
                cache: false,
                success: function (a) {
                    firebase.database().ref("users/" + user["id"]).remove();
                    hideProgress();
                    getUsers();
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function () {
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
    $("#edit-user-ok").html("Tambah").unbind().on("click", function () {
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
        firebase.database().ref("users/" + userID).set({
            name: name,
            email: email,
            password: password,
            phone: phone
        }, function (error) {
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
    $("#edit-user-select-profile-picture").on("change", function () {
        var fr = new FileReader();
        fr.onload = function () {
            $("#edit-user-profile-picture").attr("src", fr.result);
        };
        fr.readAsDataURL($(this).prop("files")[0]);
    });
    $("#edit-user-select-profile-picture").click();
}

function closeSendMessageDialog() {
    $("#chat-container").hide();
}