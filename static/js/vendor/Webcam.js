/**
 * make use of the webcam of the client
 *
 * @param The CSS selector of the video element
 *
 * @throws Exception when element with selector could not be found
 */
var Webcam = function(selector){
  /** The image stream  */
  var videoStream,
  useFallback = false,
  /** the video element */
  element = document.querySelector(selector), 
  /**
   * Checks whether or not the API is supported by the browser
   * @return boolean
   */
  isSupported = function(){
    return !!navigator.getUserMedia
  },
  /**
   * Base64 encode a ArrayBuffer
   * @param ArrayBuffer
   * @return string the base64 encoded string
   */
  base64Encode = function( buffer ) {
        var binary = ''
        var bytes = new Uint8Array( buffer )
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
  },
  /**
   * Creates a canvas element to draw upon, reused when possible
   * @return HTMLElement the canvas, never null
   */
  createCanvas = function(){
    var canvas = document.getElementById("webcamCanvas");
    if (!canvas){
      canvas = document.createElement('canvas');
      canvas.id = "webcamCanvas";
      canvas.style.display="none";
      document.body.appendChild(canvas);
    }
    return canvas;
  },
   /**
   * Creates a input element to select files with, reused when possible
   * @return HTMLElement the input of type file, never null
   */
  createInput = function(){
    var input = document.getElementById('webcamFallback');
    if (!input){ 
      input = document.createElement('input');
      input.id = "webcamFallback";
      input.type='file';
      input.accept='image/*;capture=camera'
      input.capture='capture';
      input.style.display = 'none';
      document.body.appendChild(input);
    }
    return input;
  },
  /**
   * Fallback mechanism to select files. Use this when you want to take pics from a mobile device or upload pictures from disc
   * @param function the success function, with the dataURI as a parameter
   * @param function callback mechnism to influence drawing a new image. If omitted, then a copy will be made of the webcam image
   */
  fallback = function(fnSuccess, fnDrawImage){
    element.style.display = 'none'; // disable the video element as we will not need it

    var input = createInput();
    var canvas = createCanvas();
    
    input.addEventListener('change', function(){
      var reader = new FileReader(),
        file = input.files[0];
      reader.onloadend = function(e) {
        var dataURL =  'data:'+file.type+';base64,'+base64Encode(e.target.result),
            c = createCanvas(),
            ctx = c.getContext('2d'),
            img = new Image();

        img.onload = function() {
          c.width = img.width;
          c.height = img.height;
          if (fnDrawImage){
            fnDrawImage(ctx, c);
          }
          else{
            ctx.drawImage(img, 0, 0);
          }
          fnSuccess(dataURL);
        };

        img.src = dataURL;
      };

      reader.readAsArrayBuffer(file);
    }, false);

    input.click(); // trigger file picker / mobile cam
  },
   /**
   * Takes care of initialization
   */
  init = function(){
    navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

      if (!element){
        throw "Could not find element for video with selector " + selector;
      }
  },
  /**
   * Checks whether the webcam is enabled
   * @return boolean
   */
  isStarted = function(){
    return !!videoStream || useFallback;
  }, 
  /**
   * Start the webcam, will ask the user to share his webcam
   * @param object options for the UserMedia for audio and video eg. {video: true, audio: true}
   * @param function the main success function
   * @param function the failure function
   */
  start = function(options, fnSuccess, fnFailure){
    element.play();
    navigator.getUserMedia(options||{}, function(stream){
      element.src = window.URL.createObjectURL(stream);
      // copy stream to global
      element.onloadedmetadata = function(e) {
        videoStream = stream;
      };
      fnSuccess(stream);
    }, function(){
      fallback();
      if (fnFailure){
        fnFailure();
      }
    });
  },
  /**
   * Resets the Webcam object and deletes any pictures taken
   */
  stop = function(){
    if (videoStream){
      videoStream.stop();
      element.pause();
      videoStream = null;
      element.src='';
    }
  },
  /**
   * Take a still image of the webcam
   * @param function the success function, with the dataURI as a parameter
   * @param function callback mechanism to influence drawing a new image. If omitted, then a copy will be made of the webcam image
   */
  takePicture = function(fnSuccess, fnDrawImage){
    if(isSupported()){
      var canvas = createCanvas();
      // make same size as video
      canvas.width  = element.videoWidth;
      canvas.height = element.videoHeight;

      var ctx = canvas.getContext('2d');
      if (fnDrawImage){
        fnDrawImage(ctx, canvas);
      }
      else{
        ctx.drawImage(element, 0, 0);
      }

      fnSuccess(canvas.toDataURL('image/png'));
    }
    else if(useFallback){
      fallback(fnSuccess, fnDrawImage);
    }
  },
  /**
   * Sets if a fallback mechanism should be in place to select files. Set this to true when you want to take pics from a mobile device or upload pictures from dics
   * @param boolean 
   */
  useFallback = function(bool){
    useFallback = bool;
  }, 
  /**
   * Takes in a dataUri and transforms it into a Blob
   * @param string dataURI The data uri
   * @return Blob a blob containing the image
   */
  uriToBlob = function(dataURI) {
    // serialize the base64/URLEncoded data
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    }
    else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    if (!byteString){
      throw "Unable to fetch data from dataUri";
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

  };

  init();

  return {
    element     : function(){return element;},
    fallback    : fallback,
    isStarted   : isStarted,
    isSupported : isSupported,
    start       : start,
    stop        : stop,
    takePicture : takePicture,
    uriToBlob   : uriToBlob,
    useFallback : useFallback,
  }
}