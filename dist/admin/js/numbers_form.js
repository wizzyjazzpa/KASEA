$(document).ready(function(){
$('#number_form').on('submit',function(e){

    e.preventDefault();
    let volunteer = $('#volunteer').val();
    let treatment = $('#treatment').val();
    let donations = $('#treatment').val();
     $.ajax({
            url: '/api/post_numbers', // same origin
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ volunteer,treatment,donations }),
            success: function(response) {
                if(response.status==200){
                    $('#msg').html(`<p class='alert alert-success' >${response.data}</p>`);
                   $('#msg').fadeOut(10000);
                    // console.log('Login successful:', response.token);
                }else if(response.status==201){
                     $('#msg').html(`<p class='alert alert-success' >${response.data}</p>`);
                  // $('#msg').fadeOut(10000);
                }
                else{
                     $('#smsg').html(`<p class='alert alert-danger'>${response.data}</p>`);
                   $('#smsg').fadeOut(10000);
                }
        
            // redirect or show message
            },
            error: function(xhr) {
                $('#msg').html(`<p class='alert alert-danger' style='color:white'>failed to save</p>`);
               $('#msg').fadeOut(2000);
            console.error('Login failed:', xhr.status, xhr.responseText);
            }
        });

   })
})