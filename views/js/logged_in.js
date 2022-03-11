$("#log_out").on("click", function log_out() {
    $.post("/log_out", { 
    }).done(function(data) {
        if(data.length == 0) {
            alert("Logged Out")
            window.location.replace("/login")
        } else { 
            showErrors(data)
        }
    }).fail( function () {
        alert("Sh*ts broke.");
    });
}); //event listener. When click happens run sendPython