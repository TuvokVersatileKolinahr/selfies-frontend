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

  var rest = new Rest('http://selfies.tuvok.nl/api'),
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
      hasSelfie: false,
      step: 'step1',
    }
  });

  // get all selfies
  rest.get('/selfies/16', {
    success: function(data, status, xhr){
      console.info('Got ' + data.length + ' selfies!');
      rSelfies.set('selfies', data);
    }
  });

  // EVENT handling
  rSelfies.on('flip', function(arg){
    arg.original.preventDefault();

    arg.node.classList.toggle('flipped');
  });
  rAddWizard.on('initialize',function(){
    if (this.get("initialized") === false){
      
      navigator.getUserMedia = navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia;
      var errorCallback = function(e) {
      document.getElementById('mugshot').src = 'no-means-no.webm'; // fallback.
      };
      if (navigator.getUserMedia) {

        navigator.getUserMedia({video: true, audio: false}, function(stream) {
          var video = document.getElementById('mugshot');
          video.src = window.URL.createObjectURL(stream);

          // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
          // See crbug.com/110938.
          video.onloadedmetadata = function(e) {
          // Ready to go. Do some stuff.
          localMediaStream = stream;
          };
        }, errorCallback);

        this.set('initialized', true);
      } else {
        errorCallback(); // fallback.
      }
    };
  });
  rAddWizard.on('take-selfie',function(arg){
    arg.original.preventDefault();

    if (typeof localMediaStream === 'object') {
      var canvas = document.querySelector('canvas');
      var video = document.getElementById('mugshot');
      var ctx = canvas.getContext('2d');
      var selfieimg = document.querySelector('#selfie');

      canvas.height = video.getBoundingClientRect().height;
      canvas.width  = video.getBoundingClientRect().width;

      ctx.drawImage(video, 0, 0);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      selfieimg.src = canvas.toDataURL('image/png');
      video.classList.add('hidden');
      selfieimg.classList.remove('hidden');
      }

    this.set('hasSelfie', true);
  });
  rAddWizard.on('retake-selfie',function(arg){
    arg.original.preventDefault();

    var selfieimg = document.querySelector('#selfie');
    selfieimg.classList.add('hidden');
    selfieimg.src = '';
    document.getElementById('mugshot').classList.remove('hidden');

    this.set('hasSelfie', false);
  });
  rAddWizard.on('use-selfie',function(arg){
    arg.original.preventDefault();

    this.set('step', 'step2');

    document.querySelector('.wrapper').style.backgroundImage = 'url('+document.querySelector('#selfie').src+')';
  });
  rAddWizard.on('cancel',function(arg){
    if(arg){arg.original.preventDefault();}

    this.set('hasSelfie', false);
    this.set('step', 'step1');
    
    document.getElementById('mugshot').classList.remove('hidden');
    document.getElementById('selfie').classList.add('hidden');
    document.getElementById('selfie').attributes.src = '';

    this.set('name', '');
    this.set('about','');
    this.set('error', '');
    document.querySelector('.add input').value = '';

    document.querySelector('.wrapper').classList.toggle('open-sesame');

    // revert background image
    document.querySelector('.wrapper').removeAttribute('style');
  });
  rAddWizard.on('add-selfie',function(arg){
    arg.original.preventDefault();

    var selfieimg = document.querySelector('#selfie');
    var selfieblob = dataUriToBlob(selfieimg.src);
    
     this.set('error', '');
    // validation
    if (this.get('about').length === 0){
      this.set('error', 'Field About is mandatory');
    }
    else if (this.get('about').length > 101){
      this.set('error', 'Field About can only contain 101 chars');
    }
    if (this.get('name').length === 0){
      this.set('error', 'Field title is mandatory');
    }
    else if (this.get('name').length > 27){
      this.set('error', 'Field title can only contain 27 chars');
    }

    if (!this.get('error')){
      // submit as a multipart form, along with any other data
      var form = new FormData();
      form.append('name', this.get('name'));
      form.append('about', this.get('about'));
      form.append('pic', selfieblob, "selfie.png");
      rest.post('/selfies', {
        success: function(data, status, xhr){
        console.info('post done');
        rAddWizard.set('hasSelfie', false);
        rSelfies.data.selfies.push(data.selfie);
        rAddWizard.fire('cancel');
        },
        error: function(error, status, xhr){
          error = error || 'Oops, something went wrong...';
          console.log("error", error);
          rAddWizard.set('error', error + ' (' + status + ')' );
        },
        data: form
      });
    }
  });

  function getCanvasFromHTML() {
    var canvas = document.querySelector('canvas');
    var dataURL = canvas.toDataURL();
    var file = dataURLtoBlob(dataURL);
    var form = new FormData();
    form.append('name', document.querySelector('.add input').value);
    form.append('about', document.querySelector('.add textarea').value);
    form.append('pic', file, 'canvas.png');

    return form;
  }

  function dataURLtoBlob(dataURL) {
    // Decode the dataURL
    var binary = atob(dataURL.split(',')[1]);
    // Create 8-bit unsigned array
    var array = [];
    for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    // Return our Blob object
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
  }

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

  document.querySelector('.show-add').addEventListener('mousedown', function(e){
    document.querySelector('.wrapper').classList.toggle('open-sesame');
    rAddWizard.fire('initialize');
  }, false);
});