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