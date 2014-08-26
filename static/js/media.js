  function savepic() {
    var ts = new Date().getTime();
    var selfies = JSON.parse(localStorage.getItem('selfies'));
    if (selfies == null) {
      selfies = [];
    }
    selfies.push( { 
      ts: ts,
      selfie: selfieimg.src,
      class: selfieimg.classList[1]
    } );
    localStorage.setItem('selfies', JSON.stringify(selfies));

    updategallery();
  }

    var errorCallback = function(e) {
    video.src = 'no-means-no.webm'; // fallback.
  };

  navigator.getUserMedia  = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;

  var video = document.querySelector('video');
  var canvas = document.querySelector('canvas');
  var selfieimg = document.querySelector('#selfie');
  var ctx = canvas.getContext('2d');
  var localMediaStream = null;

  function snapshot() {
    if (localMediaStream) {
      ctx.drawImage(video, 0, 0);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      selfieimg.src = canvas.toDataURL('image/png');
      // selfieimg.className = document.querySelector('video').className;
      video.classList.add('hidden');
      selfieimg.classList.remove('hidden');
    }
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true, audio: false}, function(stream) {
      var video = document.querySelector('video');
      video.src = window.URL.createObjectURL(stream);

      video.addEventListener('click', snapshot, false);
      document.querySelector('.take_selfie').addEventListener('click', snapshot, false);
      document.querySelector('.add_selfie').addEventListener('click', savepic, false);

      // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
      // See crbug.com/110938.
      video.onloadedmetadata = function(e) {
        // Ready to go. Do some stuff.
        localMediaStream = stream;
      };
    }, errorCallback);


  } else {
    video.src = 'no-means-no.webm'; // fallback.
  }
