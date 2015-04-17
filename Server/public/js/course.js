$(document).ready(function(){
	$('#del').on('click', function(){
		
		$.ajax({
   				url: 'http://api.joind.in/v2.1/talks/10889',
   				data: {
      				format: 'json'
   				},
   				error: function() {
      				$('#info').html('<p>An error has occurred</p>');
   				},
   				dataType: 'json',
   				success: function(data) {
      				
   				},
   				type: 'DELETE'
		});
	});
});