$("#sendIt").on("click", function modify_account() {
    $.post("/modify_account", { 
        new_account_name: $("#new_account_name").val(),
        new_account_password: $("#new_account_password").val(),
        account_name: $("#account_name").val(),
        account_password: $("#account_password").val(),
    }).done(function(data) {
        if(data.length == 0) {
            alert("Account Changed!")
            window.location.replace("/login")
        } else { 
            showErrors(data)
        }
    }).fail( function () {
        alert("Sh*ts broke.");
    });
}); //event listener. When click happens run sendPython

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