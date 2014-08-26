var Backend = {};
/**
 * Backend.Api makes it possible to make calls to a backend in a simplified manner. It gives supplies defaults for GET, POST, PUT, PATCH and DELETE requests
 * 
 * @param baseUrl The base url of the backend. If you want to PUT something to https://server.io/api/object then you can supply https://server.io/api as your base url. In your request methods your can supply the /object uri. Alternatively you can omit it and supply the whole url to the request method
 */
Backend.Api = function(baseUrl){

    var version = function(){return 'v1.0'},
    baseUrl = baseUrl||'',
    defaults = { xhrFields: {withCredentials: true}, contentType: 'application/x-www-form-urlencoded', type: 'GET', success: function(data, status, xhr){console.info('API request ' + xhr.status + " " + xhr.statusText + " Bytes: " + xhr.response.length);}, error: function(xhr, errorType, error){alert('XHR call failed...');}},
    get = function(uri, r){
        request( prepareRequest(uri, r, 'GET') );
    },
    post = function(uri, r){
        request( prepareRequest(uri, r, 'POST') );
    },
    put = function(uri, r){
        request( prepareRequest(uri, r, 'PUT') );
    },
    patch = function(uri, r){
        request( prepareRequest(uri, r, 'PATCH') );
    },
    del = function(uri, r){
        request( prepareRequest(uri, r, 'DELETE') );
    },
    prepareRequest = function(uri, request, type){
        request = request || {};
        request.type = type;
        request.url = uri;

        extend(request, defaults);

        return request;
    };

    function extend(a, b){
        for(var p in b){
            if (!a[p]){
                a[p] = b[p];
            }        
        }    
    };

    function request( r ){

        if ( typeof r.url === "string" && r.url.substring(0, baseUrl.length) !== baseUrl ){
            r.url = baseUrl + r.url;
        }
        var http = new XMLHttpRequest();
        http.open(r.type, r.url, true);

        http.setRequestHeader("Content-type", r.contentType);

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                r.success( decode(http), http.status, http);
            }
            else if(http.readyState == 4) {
                r.error( decode(http), http.status, http);
            }
        }
        http.send();
    };

    /**
     * Encodes the response into the right format
     *
     * @param XmlHttpRequest the ajax request object
     * 
     * @return string|object The encoded response depending on the content type, eg. application/json delivers a JSON object, text/html returns a string
     */
    function decode(xhr){
        var response = xhr.responseText;
        if (xhr.getResponseHeader('content-type').match(/json/)){
            response = JSON.parse(response);
        }
        return response;
    }

    return {
        get : get,
        post : post,
        put : put,
        patch : patch,
        del : del,
        version:version
    }
};


