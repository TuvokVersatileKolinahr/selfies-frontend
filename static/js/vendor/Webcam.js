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
  /** the video element */
  element = document.querySelector(selector),
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
   * Checks whether or not the API is supported by the browser
   * @return boolean
   */
  isSupported = function(){
    return !!navigator.getUserMedia
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
    }, fnFailure||function(){});
  }, 
  /**
   * Checks whether the webcam is enabled
   * @return boolean
   */
  isStarted = function(){
    return !!videoStream;
  },
  /**
   * Take a still image of the webcam
   * @param function callback mechnism to influence drawing a new image. If omitted, then a copy will be made of the webcam image
   * @return Blob
   */
  takePicture = function(fnDrawImage){
    var canvas = document.getElementById("webcamCanvas");
    if (!canvas){
      canvas = document.createElement('canvas');
      canvas.id = "webcamCanvas";
      canvas.style.display="none";
      document.body.appendChild(canvas);
    }
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

    return canvas.toDataURL('image/png');
  }, 
  /**
   * Resets the Webcam object and deletes any pictures taken
   */
  stop = function(){
    videoStream = null;
    element.pause();
    element.src='';
    // element.mozSrcObject=null;
    // element.removeAttribute("src");
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
    isStarted   : isStarted,
    isSupported : isSupported,
    start       : start,
    stop        : stop,
    takePicture : takePicture,
    uriToBlob   : uriToBlob
  }
}