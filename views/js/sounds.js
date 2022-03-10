// $("#selectIt").on("click", function select_sound() {
//     alert("Called");
//     $.post("/select_sound" + id, { 
//         //sound_name: $("#selectIt").val(),
//     }).done(function(data) {
//         if(data.length == 0) {
//             alert("Sound Changed!")
//             //window.location.replace("/login")
//         } else { 
//             showErrors(data)
//         }
//     }).fail( function () {
//         alert("Sh*ts broke.");
//     });
// }); //event listener. When click happens run sendPython

// $("#selectIt").on("click", function select_sound() {
//     $.post("/change_sound/" + id, {}).done(function(data){
//         alert(id);

//     })
// })

// $("a").live("click", function(){
//     alert("Called")
//     $.post("/select_sound", { 
//         sound_name: name
//     }).done(function(data) {
//         if(data.length == 0) {
//             alert("Sound Changed!")
//             //window.location.replace("/login")
//         } else { 
//             showErrors(data)
//         }
//     })
// })