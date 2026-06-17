# iOS NFC SDK Bridge

This directory contains the native iOS bridge for NFC payment release on iPhones.

## Requirements

- iOS 13+ (NFC reading support via Core NFC)
- Xcode 15+
- A physical iPhone (NFC does not work in Simulator)

## Setup

1. Add `NFCReaderUsageDescription` to `Info.plist`.
2. Enable the **Near Field Communication Tag Reading** capability in your Xcode project.
3. Import `CoreNFC` and implement `NFCNDEFReaderSessionDelegate`.

## Usage

```swift
import CoreNFC

class NFCManager: NSObject, NFCNDEFReaderSessionDelegate {
    var session: NFCNDEFReaderSession?

    func startScanning(completion: @escaping (String) -> Void) {
        session = NFCNDEFReaderSession(delegate: self, queue: nil, invalidateAfterFirstRead: true)
        session?.alertMessage = "Hold your iPhone near the NFC tag to release payment."
        session?.begin()
    }

    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        guard let record = messages.first?.records.first,
              let challenge = String(data: record.payload, encoding: .utf8) else { return }
        // Pass challenge to CampusCollar WebView via JS bridge
    }
}
```

## Web → Native Bridge

Use `WKWebView` with a `WKScriptMessageHandler` to relay NFC results back to the React PWA running in the WebView.

## Notes

- iPhone XS and later support NFC background tag reading.
- For older devices, fall back to the 6-digit code flow in the PWA.
- Payment release is triggered by passing the NDEF text record (the NFC challenge) to the backend `/api/payments/release` endpoint.
