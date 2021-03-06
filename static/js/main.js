/*
 * Selfi data format:
 * _id      string
 * about    string
 * isActive boolean
 * name     string
 * picture  url
 * uploaded timestamp
 * created_at
 */
document.addEventListener('DOMContentLoaded', function () {

  var url = (window.location.href.match(/localhost/) ? 'http://selfies.tuvok.nl' : "") + '/api',
  rest = new Rest(url),
  webcam,
  rSelfies = new Ractive({
    el: '#selfies',
    template: '#selfiestpl',
    data: { 
      selfies: [], // init with empty array
      prominent: null,
      getSrc: function(selfie){
        return selfie.picture + "?" + selfie._id;
      }
    }
  }),
  rProminent = new Ractive({
    el: '#prominent',
    template: '#prominentSelfie',
    data: {
      selfie:{}
    }
  });
  rProminent.on('close', function(arg){
    this.set('selfie', null);
  });

  rSelfies.on('react', function(arg){
    arg.original.stopPropagation();

    var keypath = arg.keypath+'.flipped';
    this.set(arg.keypath+'.active', true);

    // get selfie
    rest.get('/selfies/'+arg.context._id, {
      success: function(data, status, xhr){
        rProminent.set('selfie', data.selfies);
      }
    });
  });

  rAddWizard = new Ractive({
    el: '#addSelfie',
    template: '#addWizardtpl',
    data: {
      initialized: false,
      hasSelfie: false,
      step: 'step1',
      error: null
    }
  });
  // get all selfies
  rest.get('/selfies?limit=16', {
    success: function(data, status, xhr){
      console.info('Got ' + data.selfies.length + ' selfies!');
      rSelfies.set('selfies', data.selfies);
    }
  });
  // Flip a selfie when clicked on it
  rSelfies.on('flip', function(arg){
    arg.original.stopPropagation();

    var keypath = arg.keypath+'.flipped';
    rSelfies.set(keypath, !rSelfies.get(keypath)); // toggle
  });
  rSelfies.on('activate', function(arg){
    this.get('selfies').forEach(function(e, i){
      if (e !== arg.context && e.active === true){ /// but not for this one...
        e.active = false;
        e.flipped = false;
      }
    });
    rSelfies.update();
    this.set(arg.keypath+'.active', !this.get(arg.keypath+'.active'));
  });
  // initialize the Add Wizard 
  rAddWizard.on('initialize',function(){
      if (!webcam){
        webcam = new Webcam('#mugshot');
      }
      if (webcam.isSupported()) {
        webcam.start({video: true, audio: false}, function(stream) {
          rAddWizard.set('initialized', true);
        }, function(e) {
          rAddWizard.set('error', 'Please share your webcam to enable taking your selfie');
        });
      } else {
        this.set('error', 'Taking a picture with your webcam is not supported by the browser');
      }
  });
  rAddWizard.on('take-selfie',function(arg){
    arg.original.preventDefault();

    if (!rAddWizard.get('initialized')){
      return;
    }

    if (webcam.isSupported()) {
      var selfieimg = document.querySelector('#selfie');
      webcam.takePicture(function(pic){
          selfieimg.src = pic;
          selfieimg.classList.remove('hidden');
          webcam.element().classList.add('hidden');
          rAddWizard.set('hasSelfie', true);
        },
        function(ctx, canvas){
          var min = Math.min(canvas.width,canvas.height);
          var max = Math.max(canvas.width,canvas.height);
          canvas.width = min;
          canvas.height = min;
          ctx.drawImage(webcam.element(), (max-min)/2, 0, min,min, 0,0,min,min);
      });
    }
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

    webcam.element().classList.remove('hidden');
    webcam.stop();
    rAddWizard.set('initialized', false);
    document.getElementById('selfie').classList.add('hidden');
    document.getElementById('selfie').attributes.src = '';

    this.set('name', '');
    this.set('about','');
    this.set('error', '');
    document.querySelector('.add input').value = '';

    document.querySelector('.wrapper').classList.remove('open-sesame');

    // revert background image
    document.querySelector('.wrapper').removeAttribute('style');
  });
  rAddWizard.on('add-selfie',function(arg){
    arg.original.preventDefault();
    
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
      var selfieblob = webcam.uriToBlob(document.querySelector('#selfie').src);

      // submit as a multipart form, along with any other data
      var form = new FormData();
      form.append('name', this.get('name'));
      form.append('about', this.get('about'));
      form.append('pic', selfieblob, "selfie.png");
      rest.post('/selfies', {
        success: function(response, status, xhr){
          var selfies = rSelfies.get('selfies');
          selfies.reverse();
          selfies.push(response.selfies);
          selfies.reverse();

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

  

  document.querySelector('.show-add').addEventListener('mousedown', function(e){
    document.querySelector('.wrapper').classList.toggle('open-sesame');
    if ( document.querySelector('.wrapper').classList.contains('open-sesame')){
        rAddWizard.fire('initialize');
    } 
    else{
      rAddWizard.fire('cancel');
    }
      
    }, false);
});
