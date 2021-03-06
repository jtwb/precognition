# ≅ Precognition
*Precognition* is an HTTP traffic replay tool for NodeJS and browsers in the **Isocode** family.

It establishes a transparent proxy to the XMLHTTPRequest API and uses this to record and replay traffic.

In record mode, *Precognition* quietly stores all XHR HTTP activity to `window.XHRLog`.

In replay mode, *Precognition* matches requests by URL. Matched requests are read from `window.XHRLog`, the replay cache. Unmatched requests pass through to the native XHR implementation.



# ≅ Usage

### Accelerate isometric Javascript applications

Running an isometric Javascript app without Precognition:

0. In NodeJS
   0. MyApp.start();
      1. Fetches /users.json
      2. Gets data from nearby REST API server `xhr` `local network`
      2. Renders HTML from that data
   0. Serve rendered HTML plus myapp.js
1. Later, in browser
   2. MyApp.start();
      1. Fetches /users.json
      2. Gets data from REST API server - *full round trip* `xhr` `full round trip`
      2. Renders HTML from that data

Precognition can avoid the second call to "Fetches /users.json". In NodeJS, run Precognition in Record mode and inline window.XHRLog into the rendered static page HTML (see Replay from JSON file below). In the browser, run Precognition in Replay mode and the call to /users.json will not require a full round-trip!

With Precognition:

0. In NodeJS
   1. Precognition.record(); 
   0. MyApp.start();
      1. Fetches /users.json
      2. Gets data from nearby REST API server `xhr` `local network`
      2. Renders HTML from that data
   0. Serve rendered HTML plus myapp.js
   0. Serve rendered HTML plus myapp.js plus `<script>XHRLog = {data}</script>`
1. Later, in browser
   2. Precognition.replay();
   2. MyApp.start();
      1. Fetches /users.json
      2. Reads from XHRLog - *full round trip avoided* `xhr` `local Precognition cache`
      2. Renders HTML from that data


### Replay from JSON file
```javascript

// inline the XHRLog file and attach to window
XHRLog = {
 'GET /index.json': {
        "_responseHeaders": "Date: Mon, 09 Dec 2013 01:33:55 GMT\r\nLast-Modified: Tue, 03 Dec 2013 05:35:47 GMT\r\nServer: nginx/1.4.3\r\nConnection: keep-alive\r\nContent-Length: 181\r\nContent-Type: application/json\r\n",
        "readyState": 4,
        "response": "[{\"name\":\"Wet Cat\",\"image_path\":\"assets/images/cat2.jpg\"},{\"name\":\"Bitey Cat\",\"image_path\":\"assets/images/cat1.jpg\"},{\"name\":\"Surprised Cat\",\"image_path\":\"assets/images/cat3.jpg\"}]\n",
        "responseText": "[{\"name\":\"Wet Cat\",\"image_path\":\"assets/images/cat2.jpg\"},{\"name\":\"Bitey Cat\",\"image_path\":\"assets/images/cat1.jpg\"},{\"name\":\"Surprised Cat\",\"image_path\":\"assets/images/cat3.jpg\"}]\n",
        "responseXML": null,
        "status": 200,
        "statusText": "OK"
 }
};

// start replay mode
Precognition.replay();

$.getJSON('/index.json', function(cats) {
 // will read from XHRLog
 // will not fire a real XHR request
});
```



### Record to JSON

Try this in a [PhantomJS](http://phantomjs.org/) driver script for extra fun.

```javascript

Precognition.record();

MyApp.start();

setTimeout(function() {
 console.log(JSON.stringify(window.XHRLog));
}, 18000);

```



### Remote diagnostics

Transmitting the XHRLog for diagnostic replay.

```javascript

Precognition.record();

MyApp.start();

setTimeout(function() {
 $.post('/diagnostics', { log: window.XHRLog });
}, 18000);

```

# ≅ Compatibility

Precognition currently targets the [XHR2](http://www.w3.org/TR/XMLHttpRequest2/) API.

XHR2 | XHR | ActiveX
:---: | :---: | :---:
Yes - `v0.1.0` | Planned | Planned

FF 4+ | Chrome | Safari | IE 9+ | IE7,8 | FF 1-3
:---: | :---: | :---: | :---: | :---: | :---:
Yes - `v0.1.0` | Yes - `v0.1.0` | Yes - `v0.1.0` | Yes - `v0.1.0` | Planned | Planned

IE8 blockers
* [ES5 Object.defineProperty](http://kangax.github.io/es5-compat-table/#Object.defineProperty)
* [XHR2](http://caniuse.com/xhr2)




### Running the test

In the project directory
```bash
precognition $ python -m SimpleHTTPServer 3000
```

In your browser, visit `http://localhost:3000/test.html`



# ≅ Errata

Inspired by https://github.com/vcr/vcr.
