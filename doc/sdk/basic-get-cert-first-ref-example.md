This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to retrieve the set of systems which have referenced a certificate
(as identified by hashes).

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

### Setup

The example includes preconfigured hash constants for a certificate to look up.
Modify these for a certificate which is known to have run within the enterprise
for better results:

```js
// Hashes for the certificate to look up
// These can be replaced by a certificate which is known to have run within the
// enterprise for better results
var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'
```

### Running

To run this sample execute the
`sample/basic/basic-get-cert-first-ref-example.js` script as follows:

```sh
$ node sample/basic/basic-get-cert-first-ref-example.js
```

The output should appear similar to the following:

```
Systems that have referenced the certificate:

        {3a6f574a-3e6f-436d-acd4-bcde336b054d}: 2016-10-07 13:54:52
        {68125cd6-a5d8-11e6-348e-000c29663178}: 2016-11-08 09:29:32
```

The sample outputs the GUIDs for systems that have referenced the certificate.
The first time each system referenced the certificate is also displayed.

### Details

The majority of the sample code is shown below:

```js
// Create the client
var client = new dxl.Client(config)

// Hashes for the certificate to look up
// These can be replaced by a certificate which is known to have run within the
// enterprise for better results
var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Threat Intelligence Exchange (TIE) client
  var tieClient = new TieClient(client)

  // Get an array of systems that have referenced the certificate
  tieClient.getCertificateFirstReferences(
    function (error, systems) {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (error) {
        console.log('Error getting certificate references: ' + error.message)
      } else {
        // Display information for the systems which have referenced
        // the certificate
        console.log('\nSystems that have referenced the certificate:\n')
        systems.forEach(function (system) {
          console.log('\t' + system[FirstRefProp.SYSTEM_GUID] + ': ' +
            EpochUtil.toLocalTimeString(system[FirstRefProp.DATE])
          )
        })
      }
    },
    CERTIFICATE_BODY_SHA1,
    CERTIFICATE_PUBLIC_KEY_SHA1
  )
})
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

Next, a call is made to the TieClient instance's
[getCertificateFirstReferences()]{@link TieClient#getCertificateFirstReferences}
method, along with the hash values that are used to identify the file.

On successful execution of the first references lookup, the second parameter
provided to the callback, `systems`, contains an array of systems. The `systems`
array is iterated, displaying the system's GUID along with the first time the
system referenced the certificate.
