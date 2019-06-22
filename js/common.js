var settings;
var banks;

$(document).ready(function() {
    getSettings();
});

function getSettings() {
    $("#banks").find("*").remove();
    showProgress("Memuat pengaturan");
    $.ajax({
        type: 'GET',
        url: PHP_PATH+'get-settings.php',
        dataType: 'text',
        cache: false,
        success: function(a) {
            settings = JSON.parse(a);
            var purchasing = settings["settings"]["purchasing"];
            banks = settings["settings"]["banks"];
            $("#month-1").val(purchasing[0]["price"]);
            $("#month-1-feature-1").val(purchasing[0]["features"][0]["msg"]);
            $("#month-1-feature-2").val(purchasing[0]["features"][1]["msg"]);
            $("#month-1-feature-3").val(purchasing[0]["features"][2]["msg"]);
            $("#month-1-feature-4").val(purchasing[0]["features"][3]["msg"]);
            $("#month-3").val(purchasing[1]["price"]);
            $("#month-3-feature-1").val(purchasing[1]["features"][0]["msg"]);
            $("#month-3-feature-2").val(purchasing[1]["features"][1]["msg"]);
            $("#month-3-feature-3").val(purchasing[1]["features"][2]["msg"]);
            $("#month-3-feature-4").val(purchasing[1]["features"][3]["msg"]);
            $("#month-6").val(purchasing[2]["price"]);
            $("#month-6-feature-1").val(purchasing[2]["features"][0]["msg"]);
            $("#month-6-feature-2").val(purchasing[2]["features"][1]["msg"]);
            $("#month-6-feature-3").val(purchasing[2]["features"][2]["msg"]);
            $("#month-6-feature-4").val(purchasing[2]["features"][3]["msg"]);
            $("#month-12").val(purchasing[3]["price"]);
            $("#month-12-feature-1").val(purchasing[3]["features"][0]["msg"]);
            $("#month-12-feature-2").val(purchasing[3]["features"][1]["msg"]);
            $("#month-12-feature-3").val(purchasing[3]["features"][2]["msg"]);
            $("#month-12-feature-4").val(purchasing[3]["features"][3]["msg"]);
            for (var i=0; i<banks.length; i++) {
                var bank = banks[i];
                var bankName = getBankByType(parseInt(bank["type"])-1);
                $("#banks").append(""+
                    "<tr>" +
                        "<td>"+bank["number"]+"</td>"+
                        "<td>"+bankName+"</td>"+
                        "<td>"+bank["holder"]+"</td>"+
                        "<td><a class='delete-bank link'>Hapus</a></td>"+
                    "</tr>"
                );
            }
            setDeleteBankClickListener();
            hideProgress();
        }
    });
}

function getBankByType(index) {
    var bankNames = [
        "BNI", "BCA", "BRI", "BTN", "Mandiri", "CIMB Niaga", "Permata", "Danamon"
    ];
    return bankNames[index];
}

function setDeleteBankClickListener() {
    $(".delete-bank").unbind().on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        $("#confirm-title").html("Hapus Bank");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus bank ini?");
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
        $("#confirm-ok").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
            showProgress("Menghapus bank");
            banks.splice(index, 1);
            updateSettings();
        });
        $("#confirm-cancel").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
        });
    });
}

function addBank() {
    $("#add-bank-name option")[0].selected = true;
    $("#add-bank-holder").val("");
    $("#add-bank-number").val("");
    $("#add-bank-container").css("display", "flex").hide().fadeIn(300);
}

function closeAddBankDialog() {
    $("#add-bank-container").fadeOut(300);
}

function addNewBank() {
    var bankIndex = $("#add-bank-name").prop("selectedIndex");
    var bankHolder = $("#add-bank-holder").val().trim();
    var bankNumber = $("#add-bank-number").val().trim();
    if (bankIndex == 0) {
        show("Mohon pilih jenis bank");
        return;
    }
    if (bankHolder == "") {
        show("Mohon masukkan nama pemilik rekening");
        return;
    }
    if (bankNumber == "") {
        show("Mohon masukkan nomor rekening");
        return;
    }
    var bankName = $("#select1").find(":selected").text();
    $("#add-bank-container").fadeOut(300);
    showProgress("Menambah bank");
    banks.push({'holder': bankHolder, 'number': bankNumber, 'type': bankIndex});
    updateSettings();
}

function validate(evt) {
    var theEvent = evt || window.event;
    // Handle paste
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
        // Handle key press
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if( !regex.test(key) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
    }
}

function saveSettings() {
    var month1Price = $("#month-1").val().trim();
    var month1Feature1 = $("#month-1-feature-1").val().trim();
    var month1Feature2 = $("#month-1-feature-2").val().trim();
    var month1Feature3 = $("#month-1-feature-3").val().trim();
    var month1Feature4 = $("#month-1-feature-4").val().trim();
    var month3Price = $("#month-3").val().trim();
    var month3Feature1 = $("#month-3-feature-1").val().trim();
    var month3Feature2 = $("#month-3-feature-2").val().trim();
    var month3Feature3 = $("#month-3-feature-3").val().trim();
    var month3Feature4 = $("#month-3-feature-4").val().trim();
    var month6Price = $("#month-6").val().trim();
    var month6Feature1 = $("#month-6-feature-1").val().trim();
    var month6Feature2 = $("#month-6-feature-2").val().trim();
    var month6Feature3 = $("#month-6-feature-3").val().trim();
    var month6Feature4 = $("#month-6-feature-4").val().trim();
    var month12Price = $("#month-12").val().trim();
    var month12Feature1 = $("#month-12-feature-1").val().trim();
    var month12Feature2 = $("#month-12-feature-2").val().trim();
    var month12Feature3 = $("#month-12-feature-3").val().trim();
    var month12Feature4 = $("#month-12-feature-4").val().trim();
    if (month1Price == '' || month1Feature1 == '' || month1Feature2 == '' || month1Feature3 == '' || month1Feature4 == ''
        || month3Price == '' || month3Feature1 == '' || month3Feature2 == '' || month3Feature3 == '' || month3Feature4 == ''
        || month6Price == '' || month6Feature1 == '' || month6Feature2 == '' || month6Feature3 == '' || month6Feature4 == ''
        || month12Price == '' || month12Feature1 == '' || month12Feature2 == '' || month12Feature3 == '' || month12Feature4 == '') {
        show("Mohon isi semua kotak isian yang ada");
        return;
    }
    settings["settings"]["purchasing"][0]["price"] = parseInt(month1Price);
    settings["settings"]["purchasing"][0]["features"][0]["msg"] = month1Feature1;
    settings["settings"]["purchasing"][0]["features"][1]["msg"] = month1Feature2;
    settings["settings"]["purchasing"][0]["features"][2]["msg"] = month1Feature3;
    settings["settings"]["purchasing"][0]["features"][3]["msg"] = month1Feature4;
    settings["settings"]["purchasing"][1]["price"] = parseInt(month3Price);
    settings["settings"]["purchasing"][1]["features"][0]["msg"] = month3Feature1;
    settings["settings"]["purchasing"][1]["features"][1]["msg"] = month3Feature2;
    settings["settings"]["purchasing"][1]["features"][2]["msg"] = month3Feature3;
    settings["settings"]["purchasing"][1]["features"][3]["msg"] = month3Feature4;
    settings["settings"]["purchasing"][2]["price"] = parseInt(month6Price);
    settings["settings"]["purchasing"][2]["features"][0]["msg"] = month6Feature1;
    settings["settings"]["purchasing"][2]["features"][1]["msg"] = month6Feature2;
    settings["settings"]["purchasing"][2]["features"][2]["msg"] = month6Feature3;
    settings["settings"]["purchasing"][2]["features"][3]["msg"] = month6Feature4;
    settings["settings"]["purchasing"][3]["price"] = parseInt(month12Price);
    settings["settings"]["purchasing"][3]["features"][0]["msg"] = month12Feature1;
    settings["settings"]["purchasing"][3]["features"][1]["msg"] = month12Feature2;
    settings["settings"]["purchasing"][3]["features"][2]["msg"] = month12Feature3;
    settings["settings"]["purchasing"][3]["features"][3]["msg"] = month12Feature4;
    showProgress("Menyimpan pengaturan");
    var fd = new FormData();
    fd.append("content", JSON.stringify(settings));
    $.ajax({
        type: 'POST',
        url: PHP_PATH+'update-settings.php',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
        success: function(a) {
            hideProgress();
            show("Pengaturan disimpan");
        }
    });
}

function updateSettings() {
    var settingsJSON = JSON.stringify(settings);
    var fd = new FormData();
    fd.append("content", settingsJSON);
    $.ajax({
        type: 'POST',
        url: PHP_PATH+'update-settings.php',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
        success: function(a) {
            hideProgress();
            show("Pengaturan disimpan");
            getSettings();
        }
    });
}