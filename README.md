# ≅ Precognition
*Precognition* is an HTTP traffic replay tool in the **Isocode** family.

In record mode, *Precognition* quietly stores all XHR HTTP activity to `window.XHRLog`.

In replay mode, *Precognition* matches requests by URL. Matched requests are read from `window.XHRLog`, the replay cache. Unmatched requests pass through to the native XHR implementation.



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




# ≅ Usage

```javascript
/*
 * Activate recording mode. Data will be stored in `window.PrecogData`.
 */
Precognition.record();

/*
 * Activate replay mode. Subsequent XHR requests will be checked against
 * stored responses in `window.PrecogData`.
 */
Precognition.replay();
```

### Running the test

In the project directory
```bash
precognition $ python -m SimpleHTTPServer 3000
```

In your browser, visit `http://localhost:3000/test.html`

# ≅ Errata

Inspired by https://github.com/vcr/vcr.
