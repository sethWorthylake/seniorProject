$("#sendIt").on("click", function() {
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