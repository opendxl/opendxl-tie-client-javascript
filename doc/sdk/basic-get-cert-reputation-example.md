This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to retrieve the reputation of a certificate (as identified by its
hashes).

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
`sample/basic/basic-get-cert-reputation-example.js` script as follows:

```sh
$ node sample/basic/basic-get-cert-reputation-example.js
```

The output should appear similar to the following:

```
Certificate reputations:                  
{                                         
    "2": {                                
        "attributes": {                   
            "2108821": "94",              
            "2109077": "1454912619",      
            "2117524": "0",               
            "2120596": "0"                
        },                                
        "createDate": 1476318514,         
        "providerId": 2,                  
        "trustLevel": 99                  
    },                                    
    "4": {                                
        "attributes": {                   
            "2109333": "12",              
            "2109589": "1476318514",      
            "2139285": "73183493944770750"
        },                                
        "createDate": 1476318514,         
        "providerId": 4,                  
        "trustLevel": 0                   
    }                                     
}                                         
```

The sample outputs the reputation for a certificate.

The `key` for each property in the object corresponds to a particular `provider`
of the associated `reputation`. The list of `certificate reputation providers`
can be found in the [CertProvider]{@link module:CertProvider} constants module.

The McAfee Global Threat Intelligence (GTI) service is identified in the results
as `"providerId" : 2`. The trust level associated with the GTI response
(`"trustLevel": 99`) indicates that the certificate is known good.

See the [TrustLevel]{@link module:TrustLevel} constants module for the list of
standard trust levels.

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

  // Request reputation for the certificate
  tieClient.getCertificateReputation(
    function (error, reputations) {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (error) {
        console.log('Error getting certificate reputations: ' + error.message)
      } else {
        // Display reputation for the certificate
        console.log('Certificate reputations:')
        console.log(MessageUtils.objectToJson(reputations, true))
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
[getCertificateReputation()]{@link TieClient#getCertificateReputation}
method, along with the hash values that are used to identify the certificate.

On successful execution of the reputation lookup, the second parameter provided
to the callback, `reputations`, contains the reputations. The reputations are
printed by converting the response object to JSON with a call to the
[MessageUtils.objectToJson()](https://opendxl.github.io/opendxl-bootstrap-javascript/jsdoc/module-MessageUtils.html#.objectToJson)
method.
