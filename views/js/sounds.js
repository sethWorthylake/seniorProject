$(".selectIt").on("click", function() {
    $.post("/select_sound", { 
        soundId: $(this).val(),
    }).done(function(data) {
        if(data.length == 0) {
            alert("Sound Changed!")
            //window.location.replace("/login")
        } else { 
            showErrors(data)
        }
    }).fail( function () {
        alert("Sh*ts broke.");
    });
}); //event listener. When click happens run sendPython

$(".deleteIt").on("click", function() {
    $.post("/delete_sound", { 
        soundId: $(this).val(),
    }).done(function(data) {
        if(data.length == 0) {
            alert("Sound Deleted!")
            window.location.replace("/sounds")
        } else { 
            showErrors(data)
        }
    }).fail( function () {
        alert("Sh*ts broke.");
    });
}); //event listener. When click happens run sendPython