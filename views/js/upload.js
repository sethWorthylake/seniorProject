$("#sendIt").on("click", function() {
    $.post("/uploadSound", {
        file: $("#myFile").val()
    }).done(function(data) {
        if(data.length == 0) {
            alert("That worked")
        } else { 
            showErrors(data)
        }
    }).fail( function () {
        alert("Sh*ts broke.");
    });
}); //event listener. When click happens run 
