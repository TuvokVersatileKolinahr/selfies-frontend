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

			ractive.on('flip', function(arg){
				arg.node.querySelector('.card').classList.toggle('flipped');
			});
		}
	});
});