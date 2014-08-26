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

	var x = new Backend.Api('http://selfies.tuvok.nl/api'), ractive;

	// get all selfies
	x.get('/selfies/12', {
		success: function(data, status, xhr){
			console.info('Got ' + data.length + ' selfies!');
			 ractive = new Ractive({
			  el: '#selfies',
			  template: '#selfiestpl',
			  data: { 
			  	selfies: data,
			  	getSrc: function(selfie){
			  		return selfie.picture + "?" + selfie._id;
			  	}
			  }
			});

			ractive.on('flip', function(arg){
				arg.node.classList.toggle('flipped');
			});
		}
	});
});