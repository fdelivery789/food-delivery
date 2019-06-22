var purchases;

$(document).ready(function() {
    getPurchases();
});

function getPurchases() {
    $("#purchases").find("*").remove();
    $.ajax({
        type: 'GET',
        url: PHP_PATH+'get-purchases.php',
        dataType: 'text',
        cache: false,
        success: function(a) {
            console.log(a);
            purchases = JSON.parse(a);
            for (var i=0; i<purchases.length; i++) {
                var purchase = purchases[i];
                var date = new Date(parseInt(purchase["date"]));
                var dateText = "";
                dateText += date.getDate();
                dateText += " ";
                var monthNames = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];
                dateText += monthNames[date.getMonth()];
                dateText += " ";
                dateText += date.getFullYear();
                var desc = purchase["descr"];
                if (desc.length >= 39) {
                    desc = desc.substr(0, 39);
                    desc += "...";
                }
                $("#purchases").append(""+
                    "<tr>"+
                    "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>"+i+"</div></td>"+
                    "<td>"+purchase["email"]+"</td>"+
                    "<td>Rp "+purchase["price"]+"</td>"+
                    "<td>"+desc+"</td>"+
                    "<td>"+dateText+"</td>"+
                    "<td><a class='view-purchase link'>Lihat</a></td>"+
                    "<td><a class='delete-purchase link'>Hapus</a></td>"+
                    "</tr>"
                );
            }
            setPurchaseClickListener();
        }
    });
}

function setPurchaseClickListener() {
    $(".view-purchase").on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var purchase = purchases[index];
        $("#view-purchase-email").val(purchase["email"]);
        $("#view-purchase-price").val("Rp "+purchase["price"]);
        $("#view-purchase-desc").val(purchase["descr"]);
        var date = new Date(parseInt(purchase["date"]));
        var dateText = "";
        dateText += date.getDate();
        dateText += " ";
        var monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        dateText += monthNames[date.getMonth()];
        dateText += " ";
        dateText += date.getFullYear();
        $("#view-purchase-date").val(dateText);
        $("#view-purchase-ok").unbind().on("click", function() {
            $("#view-purchase-container").fadeOut(300);
        });
        $("#view-purchase-container").css("display", "flex").hide().fadeIn(300);
    });
    $(".delete-purchase").on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var purchase = purchases[index];
        $("#confirm-title").html("Hapus Riwayat Pembayaran");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus riwayat pembayaran ini?");
        $("#confirm-ok").unbind().on("click", function() {
            $("#confirm-container").hide();
            showProgress("Menghapus riwayat");
            $.ajax({
                type: 'GET',
                url: PHP_PATH+'delete-purchase.php',
                data: {'id': purchase["id"]},
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