This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to set the enterprise-specific `trust level` of a certificate (as
identified by its hashes).

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).

* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

* The JavaScript DXL client must be authorized to send messages to the
  `/mcafee/service/tie/cert/reputation/set` topic, which is part of the 
  `TIE Server Set Enterprise Reputation` authorization group.

  The following page provides an example of authorizing a Python client to send
  messages to an `authorization group`. While the example is based on McAfee
  Active Response (MAR), the instructions are the same with the exception of
  swapping the `TIE Server Set Enterprise Reputation` `authorization group` in
  place of `Active Response Server API`:

  <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>

### Setup

The example includes preconfigured hash constants for the certificate whose
reputation is to be set. Modify these to an appropriate certificate for the
enterprise:

```js
// Hashes for the certificate whose reputation is to be set.
var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'
```

### Running

To run this sample execute the `sample/basic/basic-set-cert-reputation-example.js`
script as follows:

```sh
$ node sample/basic/basic-set-cert-reputation-example.js
```

If the `set reputation` operation succeeds the following message will be
displayed:

```
Succeeded.
```

### Details

The majority of the sample code is shown below:

```js
// Create the client
var client = new dxl.Client(config)

// Hashes for the certificate whose reputation is to be set.
var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Threat Intelligence Exchange (TIE) client
  var tieClient = new TieClient(client)

  // Set the Enterprise reputation for the certificate to Known Trusted
  tieClient.setCertificateReputation(
    function (error) {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (error) {
        console.log('Error: ' + error.message)
      } else {
        console.log('Succeeded')
      }
    },
    TrustLevel.KNOWN_TRUSTED,
    CERTIFICATE_BODY_SHA1,
    CERTIFICATE_PUBLIC_KEY_SHA1,
    'Reputation set via OpenDXL'
  )
})
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

The enterprise-specific `trust level` is established for the certificate by
invoking the TieClient instance's
[setCertificateReputation()]{@link TieClient#setCertificateReputation} method,
along with the `hash values` used to identify the certificate.

The `comment` &mdash; "Reputation set via OpenDXL" in the above example &mdash;
is optional but is useful in identifying the particular certificate that is
associated with the hashes (especially if the certificate did not previously
exist in the TIE repository).
