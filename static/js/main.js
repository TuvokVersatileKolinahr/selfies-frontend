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
			  	selfies: [], // init with empty array
			  	getSrc: function(selfie){
			  		return selfie.picture + "?" + selfie._id;
			  	}
			  }
			}),
	rAddWizard = new Ractive({
		el: '#addSelfie',
		template: '#addWizardtpl',
		data: {
			initialized: false,
			hasSelfie: false
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
		if (this.data.initialized === false){
			
			navigator.getUserMedia = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;
	        var errorCallback = function(e) {
		      document.querySelector('video').src = 'no-means-no.webm'; // fallback.
		    };
	        if (navigator.getUserMedia) {

	        	navigator.getUserMedia({video: true, audio: false}, function(stream) {
			      var video = document.querySelector('video');
			      video.src = window.URL.createObjectURL(stream);

			      // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
			      // See crbug.com/110938.
			      video.onloadedmetadata = function(e) {
			        // Ready to go. Do some stuff.
			        localMediaStream = stream;
			      };
			    }, errorCallback);

			} else {
			    errorCallback(); // fallback.
			}

			this.set('initialized', true);
		};
	});
	rAddWizard.on('take-selfie',function(){
		if (localMediaStream) {
			var canvas = document.querySelector('canvas');
			var video = document.querySelector('video');
			var ctx = canvas.getContext('2d');
			var selfieimg = document.querySelector('#selfie');

	        canvas.height = video.getBoundingClientRect().height;
	        canvas.width  = video.getBoundingClientRect().width;

	        ctx.drawImage(video, 0, 0);
	        // "image/webp" works in Chrome.
	        // Other browsers will fall back to image/png.
	        selfieimg.src = canvas.toDataURL('image/png');
	        // selfieimg.className = document.querySelector('video').className;
	        video.classList.add('hidden');
	        selfieimg.classList.remove('hidden');
	      }

		this.set('hasSelfie', true);
	});
	rAddWizard.on('retake-selfie',function(){
		var selfieimg = document.querySelector('#selfie');
		selfieimg.classList.add('hidden');
        selfieimg.src = '';
        document.querySelector('video').classList.remove('hidden');

		this.set('hasSelfie', false);
	});
	rAddWizard.on('use-selfie',function(){
		document.querySelector('.add .step1').classList.add('hidden');
		document.querySelector('.add .step2').classList.remove('hidden');
	});

	rAddWizard.on('cancel',function(){
		
		this.set('hasSelfie', false);
		
		document.querySelector('.add .step1').classList.remove('hidden');
		document.querySelector('video').classList.remove('hidden');
		document.querySelector('.add .step2').classList.add('hidden');
		document.querySelector('#selfie').classList.add('hidden');
		document.querySelector('#selfie').attributes.src = '';

		document.querySelector('.add input').value = '';
		document.querySelector('.add input').value = '';

		document.querySelector('.wrapper').classList.toggle('open-sesame');
	});

	rAddWizard.on('add-selfie',function(){
			var selfieimg = document.querySelector('#selfie');
	    var selfieblob = dataUriToBlob(selfieimg.src);
	    var selfiename = document.querySelector('#name').value;
	    var selfieabout = document.querySelector('#about').value;
      // submit as a multipart form, along with any other data
	    var form = new FormData();
	    form.append('name', selfiename);
	    form.append('about', selfieabout);
	    form.append('pic', selfieblob);
	    var x = new Backend.Api('http://selfies.tuvok.nl/api');
	    x.post('/selfies', {
	      success: function(data, status, xhr){
	        console.info('post done');
	        rAddWizard.set('hasSelfie', false);
	        rSelfies.data.selfies.push(data.selfie);
	        rAddWizard.fire('cancel');
	      },
	      error: function(xhr, errorType, error){
	        console.log("error", error);
	      },
	      postdata: form
	    });
	});

	function dataUriToBlob(dataURI) {
	    // serialize the base64/URLEncoded data
	    var byteString;
	    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
	        byteString = atob(dataURI.split(',')[1]);
	    }
	    else {
	        byteString = unescape(dataURI.split(',')[1]);
	    }

	    // parse the mime type
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

	    // construct a Blob of the image data
	    var array = [];
	    for(var i = 0; i < byteString.length; i++) {
	        array.push(byteString.charCodeAt(i));
	    }
	    return new Blob(
	        [new Uint8Array(array)],
	        {type: mimeString}
	    );
	}

	document.querySelector('.title').addEventListener('mousedown', function(e){
		document.querySelector('.wrapper').classList.toggle('open-sesame');
		rAddWizard.fire('initialize');
	}, false);
});