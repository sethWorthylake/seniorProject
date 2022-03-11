
function showErrors(errors) { 
    console.log(errors);
    alert(errors)
    for(var error of errors) {
        var msg = $("<div class='msgbox medium error' style='display:none;'>" + error + "</div>");
        $("#login-errors").append(msg);
        msg.fadeIn(100);
    }
}