# Android NFC SDK Bridge

This directory contains the native Android bridge for NFC payment release.

## Requirements

- Android 4.0+ (API 14) with NFC hardware
- Android Studio Hedgehog or newer
- A physical Android device with NFC

## Setup

1. Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

2. Check NFC availability at runtime:

```kotlin
val nfcAdapter = NfcAdapter.getDefaultAdapter(context)
val nfcAvailable = nfcAdapter?.isEnabled == true
```

## Usage

```kotlin
import android.nfc.NfcAdapter
import android.nfc.tech.Ndef

class NfcManager(private val activity: Activity) {
    fun startReading(onResult: (String) -> Unit) {
        val adapter = NfcAdapter.getDefaultAdapter(activity) ?: return
        adapter.enableReaderMode(activity, { tag ->
            val ndef = Ndef.get(tag) ?: return@enableReaderMode
            ndef.connect()
            val challenge = String(ndef.ndefMessage.records[0].payload)
            onResult(challenge)
            ndef.close()
        }, NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_NFC_B, null)
    }

    fun stopReading() {
        NfcAdapter.getDefaultAdapter(activity)?.disableReaderMode(activity)
    }
}
```

## Web → Native Bridge

Use `WebView.addJavascriptInterface()` to expose an `NfcBridge` object to the React PWA. When NFC is tapped, call `window.NfcBridge.onNfcResult(challenge)` from native code.

## Notes

- Always disable reader mode in `onPause()` to prevent battery drain.
- For devices without NFC, the PWA falls back to the 6-digit code input.
