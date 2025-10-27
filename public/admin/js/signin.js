$(document).ready(function(e){
   $('#signin_form').on('submit',function(e){
      e.preventDefault();
     let username = $('#username').val();
    let password = $('#password').val();
    if(username == "" && password == ""){
        $('#msg').html("<p class='alert alert-warning' style'text-align:center'>Please fill the inputs before submitting</p>");
    }else{
        $.ajax({
        url: '/api/admin_login', // same origin
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        success: function(response) {
            if(response.status==200){
                 window.location.href='/admin_home';
                  // console.log('Login successful:', response.token);
            }
      
        // redirect or show message
        },
        error: function(xhr) {
              $('#msg').html("<p class='alert alert-danger' style'text-align:center'>Incorrect username/password</p>");
        console.error('Login failed:', xhr.status, xhr.responseText);
        }
        });
    }
   })
})