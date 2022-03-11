$("#sendIt").on("click", function login() {
    $.post("/login", { 
        account_name: $("#account_name").val(),
        account_password: $("#account_password").val(),
    }).done(function(data) {
        if(data.length == 0) {
            window.location.replace("/accounts")
        } else { 
            showErrors(data)
        }
    }).fail( function () {
        alert("Sh*ts broke.");
    });
}); //event listener. When click happens run sendPython
