var currentActiveConnections = 0;
var currentMaximumConnections = 1;
var currentProfilePicture = "";
var admins = [];

$(document).ready(function() {
    getAdmins();
});

function getAdmins() {
    $("#admins").find("*").remove();
    admins = [];
    showProgress("Memuat admin");
    firebase.database().ref("admins").once("value").then(function(snapshot) {
        var i = 1;
        for (var adminID in snapshot.val()) {
            var email = snapshot.val()[adminID]['email'];
            var name = snapshot.val()[adminID]['name'];
            var password = snapshot.val()[adminID]['password'];
            var phone = snapshot.val()[adminID]['phone'];
            var admin = {
                'id': adminID,
                'email': email,
                'name': name,
                'password': password,
                'phone': phone
            };
            admins.push(admin);
            $("#admins").append(""+
                "<tr>"+
                "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>"+i+"</div></td>"+
                "<td>"+name+"</td>"+
                "<td>"+phone+"</td>"+
                "<td>"+password+"</td>"+
                "<td>"+email+"</td>"+
                "<td><a class='edit-admin link'>Ubah</a></td>"+
                "<td><a class='delete-admin link'>Hapus</a></td>"+
                "</tr>"
            );
            i++;
        }
        hideProgress();
        setAdminClickListener();
    });
}

function setAdminClickListener() {
    $(".edit-admin").unbind().on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var admin = admins[index];
        $("#edit-admin-title").html("Ubah Admin");
        $("#edit-admin-name").val(admin["name"]);
        $("#edit-admin-phone").val(admin["phone"]);
        $("#edit-admin-email").val(admin["email"]);
        $("#edit-admin-password").val(admin["password"]);
        $("#edit-admin-container").css("display", "flex").hide().fadeIn(300);
        $("#edit-admin-ok").html("Ubah").unbind().on("click", function() {
            var name = $("#edit-admin-name").val().trim();
            var phone = $("#edit-admin-phone").val().trim();
            var email = $("#edit-admin-email").val().trim();
            var password = $("#edit-admin-password").val().trim();
            if (name == "") {
                show("Mohon masukkan nama");
                return;
            }
            if (phone == "") {
                show("Mohon masukkan nomor HP");
                return;
            }
            if (password == "") {
                show("Mohon masukkan kata sandi");
                return;
            }
            /*if (activeConnections <= 0) {
                show("Mohon masukkan jumlah koneksi aktif minimal 1");
                return;
            }*/
            showProgress("Mengubah informasi admin");
            var fd = new FormData();
            fd.append("id", admin["id"]);
            fd.append("name", name);
            fd.append("phone", phone);
            fd.append("password", password);
            fd.append("email", email);
            $.ajax({
                type: 'POST',
                url: PHP_PATH+'edit-admin.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function(a) {
                    $("#edit-admin-container").fadeOut(300);
                    hideProgress();
                    var response = a;
                    console.log("Response: "+response);
                    if (response == 0) {
                        for (var i=0; i<admins.length; i++) {
                            if (admins[i]["id"] == admin["id"]) {
                                admins[i]['name'] = name;
                                admins[i]['email'] = email;
                                admins[i]['password'] = password;
                                admins[i]['phone'] = phone;
                                break;
                            }
                        }
                        firebase.database().ref("admins/"+admin["id"]).set({
                            name: name,
                            email: email,
                            password: password,
                            phone: phone
                        }, function(error) {
                            getAdmins();
                        });
                    } else if (response == -1) {
                        show("Nama admin sudah digunakan");
                    } else if (response == -2) {
                        show("Nomor HP sudah digunakan");
                    } else if (response == -3) {
                        show("Email sudah digunakan");
                    } else {
                        show("Kesalahan: "+response);
                    }
                }
            });
        });
    });
    $(".delete-admin").unbind().on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var admin = admins[index];
        $("#confirm-title").html("Hapus Admin");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus admin ini?");
        $("#confirm-ok").unbind().on("click", function() {
            $("#confirm-container").hide();
            if (admins.length == 1) {
                show("Tidak bisa menghapus admin. Minimal harus ada 1 admin yang terdaftar.");
                return;
            }
            showProgress("Menghapus admin");
            $.ajax({
                type: 'GET',
                url: PHP_PATH+'delete-admin.php',
                data: {'id': admin["id"]},
                dataType: 'text',
                cache: false,
                success: function(a) {
                    firebase.database().ref("admins/"+admin["id"]).remove();
                    hideProgress();
                    show("Admin berhasil dihapus");
                    getAdmins();
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
}

function addAdmin() {
    currentActiveConnections = 0;
    currentMaximumConnections = 1;
    currentProfilePicture = "img/profile-picture.jpg";
    $("#edit-admin-title").html("Tambah Admin");
    $("#edit-admin-name").val("");
    $("#edit-admin-phone").val("");
    $("#edit-admin-email").val("");
    $("#edit-admin-password").val("");
    $("#edit-admin-container").css("display", "flex").hide().fadeIn(300);
    $("#edit-admin-ok").html("Tambah").unbind().on("click", function() {
        var name = $("#edit-admin-name").val().trim();
        var phone = $("#edit-admin-phone").val().trim();
        var email = $("#edit-admin-email").val().trim();
        var password = $("#edit-admin-password").val().trim();
        if (name == "") {
            show("Mohon masukkan nama");
            return;
        }
        if (phone == "") {
            show("Mohon masukkan nomor HP");
            return;
        }
        if (password == "") {
            show("Mohon masukkan kata sandi");
            return;
        }
        showProgress("Membuat admin");
        var fd = new FormData();
        fd.append("email", email);
        fd.append("password", password);
        fd.append("name", name);
        fd.append("phone", phone);
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'signup.php',
            data: fd,
            contentType: false,
            processData: false,
            cache: false,
            success: function(a) {
                var responseCode = parseInt(a);
                if (responseCode == -1) {
                    alert("Email sudah digunakan");
                    hideProgress();
                } else {
                    var adminID = responseCode;
                    var admin = {
                        'id': adminID,
                        'name': name,
                        'email': email,
                        'password': password,
                        'phone': phone
                    };
                    admins.push(admin);
                    firebase.database().ref("admins/"+adminID).set({
                        name: name,
                        email: email,
                        password: password,
                        phone: phone
                    }, function(error) {
                        $("#edit-admin-container").fadeOut(300);
                        getAdmins();
                    });
                }
            }
        });

        /*var fd = new FormData();
        fd.append("name", name);
        fd.append("phone", phone);
        fd.append("password", password);
        fd.append("email", email);
        fd.append("register_date", new Date().getTime());
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'create-admin.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function(a) {

                var response = a;
                console.log("Response: "+response);
                if (response == 0) {
                    $("#edit-admin-container").fadeOut(300);

                } else if (response == -1) {
                    show("Nama admin sudah digunakan");
                } else if (response == -2) {
                    show("Nomor HP sudah digunakan");
                } else if (response == -3) {
                    show("Email sudah digunakan");
                } else {
                    show("Kesalahan: "+response);
                }
            }
        });*/
    });
}

function closeEditAdminDialog() {
    $("#edit-admin-container").fadeOut(300);
}