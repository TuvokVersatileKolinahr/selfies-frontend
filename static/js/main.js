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

	var x = new Backend.Api('http://selfies.tuvok.nl/api'),
	ractive = new Ractive({
			  el: '#selfies',
			  template: '#selfiestpl',
			  data: { 
			  	selfies: {},
			  	getSrc: function(selfie){
			  		return selfie.picture + "?" + selfie._id;
			  	}
			  }
			});

	// get all selfies
	x.get('/selfies/12', {
		success: function(data, status, xhr){
			console.info('Got ' + data.length + ' selfies!');
			ractive.set('selfies', data);
		}
	});

	// EVENT handling
	ractive.on('flip', function(arg){
		arg.node.classList.toggle('flipped');
	});

	var openSesameHander = function(e){
		document.querySelector('.wrapper').classList.toggle('open-sesame');
	}
	document.querySelector('.title').addEventListener('mousedown', openSesameHander, false);
	document.querySelector('.title').addEventListener('touchstart', openSesameHander, false);
});