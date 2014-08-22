/*
 * Selfi data format
 * _id      string
 * about    string
 * isActive boolean
 * name     string
 * picture  url
 * uploaded timestamp
 */
document.addEventListener('DOMContentLoaded', function () {

	var x = new Backend.Api(), ractive;

	// get all selfies
	x.get('/selfies', {
		success: function(data, status, xhr){
			console.info('Got ' + data.length + ' selfies!');
			 ractive = new Ractive({
			  el: '#selfies',
			  template: '#selfiestpl',
			  data: { selfies: data }
			});
		}
	});

	// cards layout
	document.addEventListener('click', function(e){
		var list = e.target.classList
		if (list.contains('handle')){
			e.target.parentNode.parentNode.classList.toggle('flipped');
		}
	}, false);
});