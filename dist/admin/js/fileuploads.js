$(document).ready(function(){

      $('#events_form').on('submit', function (e) {
      e.preventDefault();
        //let heading = $('#heading').val();
       const formData = new FormData(this); // collect form data
       for (let pair of formData.entries()) {
       alert(pair[0] + ':', pair[1]);
    }
       $.ajax({
        url: '/api/events_upload',
        type: 'POST',
        contentType: false,
         processData: false,         
        data: formData,
        success: function (response) {
          alert(response.message);
        },
        error: function (xhr) {
          alert('Upload failed: ' + xhr.responseText);
        }
      });
     //  formData.append('image',image)
      // formData.append('heading',heading);
      
    });
})