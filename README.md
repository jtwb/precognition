*≅ Precognition* is an HTTP traffic replay tool in the *Isocode* family.

In record mode, *Precognition* quietly stores all XHR HTTP activity.

In replay mode, *Precognition* matches requests by URL. Matched requests are read from the replay cache. Unmatched requests pass through.

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

# ≅ Errata

Inspired by [https://github.com/vcr/vcr].