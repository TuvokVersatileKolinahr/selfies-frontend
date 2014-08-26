  function savepic() {
    console.log("selfieimg.src", selfieimg.src);
    var name = document.querySelector('#name').value;
    var about = document.querySelector('#about').value;
    var x = new Backend.Api('http://selfies.tuvok.nl/api');
    x.post('/selfies', {
      success: function(data, status, xhr){
        console.info('post done');
      },
      error: function(xhr, errorType, error){
        console.log("error", error);
      },
      postdata: 'name=' + name + '&about=' + about + '&pic=' + selfieimg.src
    });

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

  function retake() {
      selfieimg.classList.add('hidden');
      video.classList.remove('hidden');
      selfieimg.src = '';
      document.getElementsByClassName('step2')[0].classList.remove('active');
  }

  function snapshot() {
    if (localMediaStream) {
      canvas.width = 580;
      canvas.height = 773;

      ctx.drawImage(video, 0, 0);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      selfieimg.src = canvas.toDataURL('image/png');
      // selfieimg.className = document.querySelector('video').className;
      video.classList.add('hidden');
      selfieimg.classList.remove('hidden');
      document.getElementsByClassName('step2')[0].classList.add('active');
    }
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true, audio: false}, function(stream) {
      var video = document.querySelector('video');
      video.src = window.URL.createObjectURL(stream);

      video.addEventListener('click', snapshot, false);
      document.querySelector('.take_selfie').addEventListener('click', snapshot, false);
      document.querySelector('.retake_selfie').addEventListener('click', retake, false);
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
