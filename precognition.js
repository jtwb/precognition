/*
 * TODO Split me into files
 * TODO Browser support
 * - ActiveX XHR object
 * - readyState
 * TODO find or create XHR Test suite
 */
;
(function(undefined) {
  var root = window || this;

  var MODE_REPLAY = 'replay',
      MODE_RECORD = 'record',
      MODE_OFF = 'off';


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
   * Runtime data
   */
  var nativeXHR = XMLHttpRequest;
  var Data = {};

  /*
   * XHRProxy
   */
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

  var XHRProxy = klass({

    initialize: function(params) {
      var self = this;
      var nativeInstance = this.__native = new nativeXHR(params);

      (function setupXHRHooks() {
        // for each hook
        // attach a default handler which
        // - fires onHook
        // - fires ononsuccess (or similar)
        // - fires user onsuccess (or similar) if given
        for (var i in XHR_HOOKS) {
          var name = XHR_HOOKS[i];
          nativeInstance[name] = function() {
            self.onHook.apply(self, arguments);
            self['on' + name] && self['on' + name].apply(self, arguments);
            self[name] && self[name].apply(this, arguments);
          };
        }
      })();

      (function setupXHRMutableProperties() {
        // for each mutable property
        // use Gecko Watch (polyfill)
        // which uses Object.defineProperty
        // forward mutations to the native object
        for (var i in XHR_MUTABLE_PROPERTIES) {
          var name = XHR_MUTABLE_PROPERTIES[i];
          this.watch(name, function(_, __, value) {
            nativeInstance[name] = value;
            return value;
          });
        }
      })();
    },

    onHook: function() {
      console.log(arguments);
    },

    abort: proxy('abort'),
    open: proxy('open'),
    send: proxy('send'),
    overrideMimeType: proxy('overrideMimeType'),
    getResponseHeader: proxy('getResponseHeader'),
    getAllResponseHeaders: proxy('getAllResponseHeaders'),
    setRequestHeader: proxy('setRequestHeader'),
    upload: proxy('upload'),
    
    syncProperties: function() {
      // when readyState < 2,
      // reading immutable properties throws DOMException
      if (nativeInstance.readyState >= 2) {
        copyProperties(XHR_IMMUTABLE_PROPERTIES, nativeInstance, this);
      }
    }
  });

  /*
   * XHR Proxy: Recorder
   */
  var XHRRecorder = XHRProxy.extend({
    getAllResponseHeaders: proxy('getAllResponseHeaders', function(next, args) {
      var retval = next(args);
      console.log('getAll');
      console.log(retval);
    }),
  });

  /*
   * XHR Proxy: Replay
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
