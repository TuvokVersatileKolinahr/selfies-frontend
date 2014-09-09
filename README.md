selfies-frontend
================

Frontend code for the Selfie Service. It's a HTML5 coded interface to the [selfies-backend](https://github.com/TuvokVersatileKolinahr/selfies-backend/releases/latest). 

### Installation ###
Clone this repo

  git clone git@github.com:TuvokVersatileKolinahr/selfies-frontend.git

Make sure you have the backend running at the following url:

  http://www.yourserverhost.com/api

Installations that differ from this apporach should revies `main.js` and fix the following line of code:
 
  var rest = new Rest('/api'),

Any endpoint to the selfies-backend should be working as long as your server is able to recieve CORS headers. See [enabling CORS on your server](http://www.w3.org/wiki/CORS_Enabled) for an explanation and [enable cross-origin resource sharing](http://enable-cors.org/) for some more. If you use `nginx` here is an example for a [Wide-open CORS config for nginx](https://gist.github.com/michiel/1064640).

