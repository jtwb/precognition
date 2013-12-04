/*
 * TODO Split me into files
 * TODO Browser support
 * - ActiveX XHR object
 * - readyState
 * TODO find or create XHR Test suite
 */
;
// Begin scope
(function(undefined) {

  // unused pattern for node support
  var root = window || this;



  // 
  // ******* CONSTANTS *******
  //
  // mode constants
  var MODE_REPLAY = 'replay',
      MODE_RECORD = 'record',
      MODE_OFF = 'off';


  // XHR constants
  var XHR_HOOKS = [
    'onerror',
    'onload',
    'onreadystatechange',
    'ontimeout',
  ];

  var XHR_MUTABLE_PROPERTIES = [
    'timeout',
    'withCredentials'
  ];

  var XHR_IMMUTABLE_PROPERTIES = [
    'readyState',
    'response',
    'responseText',
    'responseXML',
    'status',
    'statusText'
  ];
  /*
   * jQuery target set:
   *
   * new(0)
   * open(5)
   * send(1)
   * overrideMimeType(1)
   * setRequestHeader(2)
   * onload
   * onerror
   * status
   * statusText
   * responseText
   * getAllResponseHeaders(0)
   * abort(0)
   *
   * Others listed in MDN:
   * getResponseHeader(1)
   * onreadystatechange
   * response
   * responseType
   * responseXML
   * timeout
   * ontimeout
   * upload(1)
   * withCredentials
   */


  //
  // ************ RUNTIME CLOSURE DATA ***********
  // 
  var nativeXHR = XMLHttpRequest;
  var Data = {};



  //
  // ************ PRIVATE UTILITY ****************
  var noop = function() { };

  var passthru = function(callback, args) { return callback(args) };

  var chain = function(first, next) {
    return function() { 
      return first(next, arguments);
    };
  };

  var copyProperties = function(proplist, from, into) {
    for (var i in proplist) {
      var name = proplist[i];
      into[name] = from[name];
    }
  };

  var proxy = function(fname, wrap) {
    var wrap = wrap || passthru;
    return function() {
      var proxyInstance = this;
      var nativeInstance = this.__native;
      var args = arguments;
      var goNative = function(args) {
        proxyInstance.syncProperties();
        nativeInstance[fname].apply(nativeInstance, args);
      };
      console.log('proxy', fname);
      return wrap(goNative, args);
    };
  };



  //
  // *********** XHRProxy *************
  //
  /*
   * On property setters:
   *  The XHR API can be configured by setting properties,
   *  e.g. myxhr.timeout = 3000;
   *  The Recorder proxy may fail to capture these settings in IE < 9.
   *
   * Property setter strategy:
   * 1 Sync values on all recieved function calls
   * 2 Use defineSetter and defineProperty to catch "late" configuration
   * 3 Ignore late configuration in IE<=8
   */
  /*
   * Stories
   * When a proxy method is called, it should trigger syncValues
   * When a proxy method is called, it should apply the args to the native function of given name
   * When a proxy method is called, if a wrapper is given, it should let the wrapper adjust the arguments and return value
   */
  var XHRProxy = klass(function(params) {
      var self = this;
      var nativeInstance = this.__native = new nativeXHR(params);

      (function setupXHRHooks() {

        // for each hook
        // attach a default handler which
        // - fires onHook
        // - fires ononload
        // - fires user onload
        for (var i in XHR_HOOKS) {
          (function() {
            var name = XHR_HOOKS[i];
            nativeInstance[name] = function() {
              console.log(name);

              // fire onHook for all hooks
              self.onHook.apply(self, arguments);

              // fire ononload
              self['on' + name] && self['on' + name].apply(self, arguments);

              // fire onload
              self[name] && self[name].apply(this, arguments);
            };
          })();
        }
      })();

    })
  .methods({


    abort: proxy('abort'),
    open: proxy('open'),
    send: proxy('send'),
    overrideMimeType: proxy('overrideMimeType'),
    getResponseHeader: proxy('getResponseHeader'),
    getAllResponseHeaders: proxy('getAllResponseHeaders'),
    setRequestHeader: proxy('setRequestHeader'),
    upload: proxy('upload'),
    
    syncProperties: function() {
      var nativeInstance = this.__native;
      // when readyState < 2,
      // reading immutable properties throws DOMException
      if (nativeInstance.readyState >= 2) {
        copyProperties(XHR_IMMUTABLE_PROPERTIES, nativeInstance, this);
      }
    }
  });



  //
  // ****************** XHRRecorder ******************
  //
  var XHRRecorder = XHRProxy.extend(function() {
    var self = this;
    var nativeInstance = this.__native;

    (function setupXHRMutableProperties() {
      // for each mutable property
      // use Gecko Watch (polyfill)
      // which uses Object.defineProperty
      // forward mutations to the native object
      for (var i in XHR_MUTABLE_PROPERTIES) {
        (function() {
          var name = XHR_MUTABLE_PROPERTIES[i];
          this.watch(name, function(_, __, value) {
            nativeInstance[name] = value;
            return value;
          });
        })();
      }
    })();
  })
  .methods({

    onHook: function() {
      this.syncProperties();
    },

    // TODO record some shit
    ononload: function(next, args) {
      console.log('onload');
      console.log(arguments);
    },

    ononerror: function(next, args) {
      console.log('onerror');
      console.log(arguments);
    }
  });



  /*
   * XHR Proxy: Replay
   *
   * XMLHttpRequest.prototype.open = function() { ... }
   *
   * on 'send', fire user onload
   * responseText, status, getAllResponseHeaders must all
   * respond with fake data
   *
   * no need to watch the mutable settings
   * as they will be ignored
   */
  var XHRReplay = XHRProxy.extend({
  });



  /*
   * Core controller
   */
  var Precognition = {

    mode: MODE_REPLAY,

    nativeXHR: nativeXHR,

    record: function() {
      Precognition.mode = MODE_RECORD;
      root.XMLHttpRequest = XHRRecorder;
    },

    replay: function() {
      Precognition.mode = MODE_REPLAY;
      root.XMLHttpRequest = XHRReplay;
    },

    off: function() {
      Precognition.mode = MODE_OFF;
      root.XMLHttpRequest = nativeXHR;
    }
  };



  /*
   * Attach library to window
   */
  root.Precognition = Precognition;
  root.PrecogData = Data;
})();
