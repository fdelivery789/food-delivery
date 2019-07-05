var m3uData;
var channels = [];
var currentChannelIndex = 0;

$(document).ready(function() {
    getChannels();
});

function getChannels() {
    showProgress("Memuat channel");
    channels = [];
    $("#channels").find("*").remove();
    $.ajax({
        type: 'GET',
        url: 'https://iptvjoss.com/jossstreambe/channels.m3u',
        dataType: 'text',
        cache: false,
        success: function(a) {
            try {
                m3uData = a;
                var length = occurrences(m3uData, "#EXTINF");
                var a = 0;
                for (var i = 0; i < length; i++) {
                    a = m3uData.indexOf("#EXTINF", a) + 7;
                    var b = m3uData.indexOf("tvg-id", a) + 8;
                    var c = m3uData.indexOf("\"", b);
                    var id = m3uData.substr(b, c-b);
                    b = m3uData.indexOf("tvg-name", a) + 10;
                    c = m3uData.indexOf("\"", b);
                    var name = m3uData.substr(b, c-b);
                    b = m3uData.indexOf("tvg-logo", a) + 10;
                    c = m3uData.indexOf("\"", b);
                    var logo = m3uData.substr(b, c-b);
                    b = m3uData.indexOf("group-title", a) + 13;
                    c = m3uData.indexOf("\"", b);
                    var category = m3uData.substr(b, c-b);
                    a = m3uData.indexOf("group-title", a);
                    b = m3uData.indexOf("http", a);
                    c = m3uData.indexOf("\n", b);
                    var channelURL = m3uData.substr(b, c - b);
                    $("#channels").append(""+
                        "<tr>"+
                        "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>"+i+"</div></td>"+
                        "<td class='channel-name'>"+name+"</td>"+
                        "<td class='category'>"+category+"</td>"+
                        "<td class='url'>"+channelURL+"</td>"+
                        "<td><a class='edit-channel link'>Ubah</a></td>"+
                        "<td><a class='delete-channel link'>Hapus</a></td>"+
                        "</tr>"
                    );
                    channels.push({'id': id, 'name': name, 'logo': logo, 'category': category, 'url': channelURL});
                }
                setChannelClickListener();
                hideProgress();
            } catch (e) {
                console.log(e.toString());
            }
        }
    });
}

function setChannelClickListener() {
    $(".edit-channel").unbind().on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        currentChannelIndex = index;
        var channel = channels[index];
        $("#edit-channel-name").val(channel["name"]);
        $("#edit-channel-category").val(channel["category"]);
        $("#edit-channel-url").val(channel["url"]);
        $("#edit-channel-logo").attr("src", channel["logo"]);
        $("#edit-channel-title").html("Ubah Channel");
        $("#change-logo").unbind().on("click", function() {
            if (isMobile()) {
                Native.selectImage(1);
            } else {
                $("#select-logo").on("change", function () {
                    var file = $("#select-logo").prop("files")[0];
                    var fr = new FileReader();
                    fr.onload = function () {
                        $("#edit-channel-logo").attr("src", fr.result);
                        showProgress("Mengunggah logo");
                        var fd = new FormData();
                        var fileName = generateRandomID(14);
                        fd.append("file", file);
                        fd.append("file_name", fileName);
                        $.ajax({
                            type: 'POST',
                            url: PHP_PATH + 'upload-image.php',
                            data: fd,
                            processData: false,
                            contentType: false,
                            cache: false,
                            success: function (a) {
                                console.log("File name: " + fileName);
                                var fileURL = "https://iptvjoss.com/jossstreambe/userdata/imgs/" + fileName;
                                channels[index]["logo"] = fileURL;
                                $("#channels").find("img:eq(" + index + ")").attr("src", fileURL);
                                m3uData = "#EXTM3U\n";
                                for (var i = 0; i < channels.length; i++) {
                                    var channel = channels[i];
                                    m3uData += ("#EXTINF:-1 tvg-id=\"" + channel["id"] + "\" tvg-name=\"" + channel["name"] + "\" tvg-logo=\"" + channel["logo"] + "\" group-title=\"" + channel["category"] + "\"," + channel["name"] + "\n" + channel["url"] + "\n");
                                }
                                var fd = new FormData();
                                fd.append("channel_data", m3uData);
                                $.ajax({
                                    type: 'POST',
                                    url: PHP_PATH + 'save-channels.php',
                                    data: fd,
                                    processData: false,
                                    contentType: false,
                                    cache: false,
                                    success: function (a) {
                                        hideProgress();
                                        show("Logo channel berhasil dirubah");
                                    }
                                });
                            }
                        });
                    };
                    fr.readAsDataURL(file);
                }).click();
            }
        });
        $("#edit-channel-ok").unbind().on("click", function() {
            var name = $("#edit-channel-name").val();
            var category = $("#edit-channel-category").val();
            var url = $("#edit-channel-url").val();
            if (name == "") {
                show("Mohon masukkan nama channel");
                return;
            }
            if (category == "") {
                show("Mohon masukkan kategori channel");
                return;
            }
            if (url == "") {
                show("Mohon masukkan URL channel");
                return;
            }
            channels[index]["name"] = name;
            channels[index]["category"] = category;
            channels[index]["url"] = url;
            $("#channels").find(".channel-name:eq("+index+")").html(name);
            $("#channels").find(".category:eq("+index+")").html(category);
            $("#channels").find(".url:eq("+index+")").html(url);
            showProgress("Menyimpan channel");
            m3uData = "#EXTM3U\n";
            for (var i=0; i<channels.length; i++) {
                var channel = channels[i];
                m3uData += ("#EXTINF:-1 tvg-id=\""+channel["id"]+"\" tvg-name=\""+channel["name"]+"\" tvg-logo=\""+channel["logo"]+"\" group-title=\""+channel["category"]+"\","+channel["name"]+"\n"+channel["url"]+"\n");
            }
            var fd = new FormData();
            fd.append("channel_data", m3uData);
            $.ajax({
                type: 'POST',
                url: PHP_PATH+'save-channels.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function(a) {
                    $("#edit-channel-container").fadeOut(300);
                    hideProgress();
                    show("Channel disimpan");
                }
            });
        });
        $("#edit-channel-cancel").unbind().on("click", function() {
            $("#edit-channel-container").fadeOut(300);
        });
        $("#edit-channel-container").css("display", "flex").hide().fadeIn(300);
    });
    $(".delete-channel").unbind().on("click", function() {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var channel = channels[index];
        $("#confirm-title").html("Hapus Channel");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus channel ini?");
        $("#confirm-ok").unbind().on("click", function() {
            showProgress("Menghapus channel");
            channels.splice(index, 1);
            $("#channels").find("tr:eq("+index+")").remove();
            m3uData = "#EXTM3U\n";
            for (var i=0; i<channels.length; i++) {
                var channel = channels[i];
                m3uData += ("#EXTINF:-1 tvg-id=\""+channel["id"]+"\" tvg-name=\""+channel["name"]+"\" tvg-logo=\""+channel["logo"]+"\" group-title=\""+channel["category"]+"\","+channel["name"]+"\n"+channel["url"]+"\n");
            }
            var fd = new FormData();
            fd.append("channel_data", m3uData);
            $.ajax({
                type: 'POST',
                url: PHP_PATH+'save-channels.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function(a) {
                    $("#confirm-container").hide();
                    hideProgress();
                    show("Channel dihapus");
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
}

function occurrences(string, subString, allowOverlapping) {
    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);
    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;
    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

function isCategoryAlreadyAdded(name) {
    // Check if categori exists
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        if (category == name) {
            return true;
        }
    }
    return false;
}

function addChannel() {
    var logoURL = "";
    $("#edit-channel-name").val("");
    $("#edit-channel-category").val("");
    $("#edit-channel-url").val("");
    $("#edit-channel-logo").attr("src", "");
    $("#edit-channel-title").html("Tambah Channel");
    $("#change-logo").unbind().on("click", function() {
        $("#select-logo").on("change", function() {
            var file = $("#select-logo").prop("files")[0];
            var fr = new FileReader();
            fr.onload = function() {
                $("#edit-channel-logo").attr("src", fr.result);
                showProgress("Mengunggah logo");
                var fd = new FormData();
                var fileName = generateRandomID(14);
                fd.append("file", file);
                fd.append("file_name", fileName);
                $.ajax({
                    type: 'POST',
                    url: PHP_PATH+'upload-image.php',
                    data: fd,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function(a) {
                        console.log("File name: "+fileName);
                        var fileURL = "https://iptvjoss.com/jossstreambe/userdata/imgs/"+fileName;
                        logoURL = fileURL;
                        hideProgress();
                    }
                });
            };
            fr.readAsDataURL(file);
        }).click();
    });
    $("#edit-channel-ok").unbind().on("click", function() {
        var name = $("#edit-channel-name").val().trim();
        var category = $("#edit-channel-category").val().trim();
        var url = $("#edit-channel-url").val().trim();
        var logo = logoURL;
        if (name == "") {
            show("Mohon masukkan nama channel");
            return;
        }
        if (category == "") {
            show("Mohon masukkan kategori channel");
            return;
        }
        if (url == "") {
            show("Mohon masukkan URL channel");
            return;
        }
        var id = name.split(" ").join('.');
        console.log("URL Channel: "+url);
        var newChannel = {'id': id, 'name': name, 'logo': logoURL, 'category': category, 'url': url};
        channels.push(newChannel);
        console.log("URL Channel (2): "+newChannel["url"]);
        console.log("URL Channel (3): "+channels[channels.length-1]["url"]);
        $("#channels").append(""+
            "<tr>"+
            "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>"+channels.length+"</div></td>"+
            "<td>"+id+"</td>"+
            "<td class='channel-name'>"+name+"</td>"+
            "<td><img src='"+logo+"' width='40px' height='40px'></td>"+
            "<td class='category'>"+category+"</td>"+
            "<td class='url'>"+url+"</td>"+
            "<td><a class='edit-channel link'>Ubah</a></td>"+
            "<td><a class='delete-channel link'>Hapus</a></td>"+
            "</tr>"
        );
        setChannelClickListener();
        m3uData = "#EXTM3U\n";
        for (var i=0; i<channels.length; i++) {
            var channel = channels[i];
            m3uData += ("#EXTINF:-1 tvg-id=\""+channel["id"]+"\" tvg-name=\""+channel["name"]+"\" tvg-logo=\""+channel["logo"]+"\" group-title=\""+channel["category"]+"\","+channel["name"]+"\n"+channel["url"]+"\n");
        }
        var fd = new FormData();
        fd.append("channel_data", m3uData);
        showProgress("Menambah channel");
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'save-channels.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function(a) {
                $("#edit-channel-container").fadeOut(300);
                hideProgress();
                show("Channel baru ditambahkan");
            }
        });
    });
    $("#edit-channel-cancel").unbind().on("click", function() {
        $("#edit-channel-container").css("display", "flex").fadeOut(300);
    });
    $("#edit-channel-container").css("display", "flex").hide().fadeIn(300);
}

function generateRandomID(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function imageSelected(code, url) {
    if (code == 1) {
        channels[currentChannelIndex]["logo"] = url;
        $("#channels").find("img:eq(" + currentChannelIndex + ")").attr("src", url);
        m3uData = "#EXTM3U\n";
        for (var i = 0; i < channels.length; i++) {
            var channel = channels[i];
            m3uData += ("#EXTINF:-1 tvg-id=\"" + channel["id"] + "\" tvg-name=\"" + channel["name"] + "\" tvg-logo=\"" + channel["logo"] + "\" group-title=\"" + channel["category"] + "\"," + channel["name"] + "\n" + channel["url"] + "\n");
        }
        var fd = new FormData();
        fd.append("channel_data", m3uData);
        $.ajax({
            type: 'POST',
            url: PHP_PATH + 'save-channels.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (a) {
                hideProgress();
                show("Logo channel berhasil dirubah");
            }
        });
    }
}

function isMobile() {
    var isAndroid = /(android)/i.test(navigator.userAgent);
    return isAndroid;
}