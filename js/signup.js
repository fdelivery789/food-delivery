$(document).ready(function() {
});

function signup() {
    var name = $("#name").val().trim();
    var email = $("#email").val().trim();
    var phone = $("#phone").val().trim();
    var password = $("#password").val().trim();
    if (name == "") {
        show("Mohon masukkan nama");
        return;
    }
    if (email == "") {
        show("Mohon masukkan email");
        return;
    }
    if (phone == "") {
        show("Mohon masukkan no. HP");
        return;
    }
    if (password == "") {
        show("Mohon masukkan kata sandi");
        return;
    }
    showProgress("Sedang mendaftar");
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
            if (responseCode == 0) {
                var fd = new FormData();
                fd.append("email", email);
                fd.append("password", password);
                $.ajax({
                    type: 'POST',
                    url: PHP_PATH+'login.php',
                    data: fd,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function(a) {
                        firebase.database().ref("admins/"+user.uid).set({
                            name: name,
                            email: email,
                            phone: phone,
                            password: password
                        }, function(error) {
                            hideProgress();
                            window.location.href = "admins.html";
                        });
                    }
                });
            } else if (responseCode == -1) {
                alert("Email sudah digunakan");
                hideProgress();
            }
        }
    });
}