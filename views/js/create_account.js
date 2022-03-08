$("#sendIt").on("click", function account_create() {
    $.post("/account_create", {
        default_account_name: $("#default_account_name").val(),
        new_account_name: $("#new_account_name").val(),
        new_account_password: $("#new_account_password").val()
    }).done(function(data) {
        if(data.length == 0) {
            alert("Account Created Now Login!")
            window.location.replace("/login")
        } else { 
            showErrors(data)
        }
    }).fail( function () {
        alert("Sh*ts broke.");
    });
}); //event listener. When click happens run sendPython
