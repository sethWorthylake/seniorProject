//FRONT END JAVASCRIPT THAT interacts with HTML page

//can use ajax post to send info to back end
$("#sendIt").on("click", function sendPython() {
    $.post("/sendPython", {
        dataPython: $("#sendPython").val(),
    }).done(function() {
        alert("Data sent!");
    });
}); //event listener. When click happens run sendPython

