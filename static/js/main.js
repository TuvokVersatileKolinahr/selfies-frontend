/*
 * Selfi data format:
 * _id      string
 * about    string
 * isActive boolean
 * name     string
 * picture  url
 * uploaded timestamp
 */
document.addEventListener('DOMContentLoaded', function () {

	var x = new Backend.Api('http://selfies.tuvok.nl/api'),
	rSelfies = new Ractive({
			  el: '#selfies',
			  template: '#selfiestpl',
			  data: { 
			  	selfies: {},
			  	getSrc: function(selfie){
			  		return selfie.picture + "?" + selfie._id;
			  	}
			  }
			}),
	rAddWizard = new Ractive({
		el: '#addSelfie',
		template: '#addWizardtpl',
		data: {
			initialized: false
		}
	});

	// get all selfies
	x.get('/selfies/12', {
		success: function(data, status, xhr){
			console.info('Got ' + data.length + ' selfies!');
			rSelfies.set('selfies', data);
		}
	});

	// EVENT handling
	rSelfies.on('flip', function(arg){
		arg.node.classList.toggle('flipped');
	});
	rAddWizard.on('initialize',function(){
		if (this.data.initialized === false && !Loader.jsExists('static/js/media.js')){
			Loader.loadJs('static/js/media.js');
			this.set('initialized', true);
		}
	});


	document.querySelector('.title').addEventListener('mousedown', function(e){
		document.querySelector('.wrapper').classList.toggle('open-sesame');
		rAddWizard.fire('initialize');
	}, false);
});