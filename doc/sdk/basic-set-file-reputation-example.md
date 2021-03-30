This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to set the enterprise-specific `trust level` of a file (as
identified by its hashes).


>From **TIE Server 3.0.0** and above it's recommended for automated integrations to set an External Reputation (see {@tutorial basic-set-external-file-reputation-example}) instead of an Enterprise Override.


### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).

* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

* The JavaScript DXL client must be authorized to send messages to the
  `/mcafee/service/tie/file/reputation/set` topic, which is part of the 
  `TIE Server Set Enterprise Reputation` authorization group.

  The following page provides an example of authorizing a Python client to send
  messages to an `authorization group`. While the example is based on McAfee
  Active Response (MAR), the instructions are the same with the exception of
  swapping the `TIE Server Set Enterprise Reputation` `authorization group` in
  place of `Active Response Server API`:

  <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>

### Running

To run this sample execute the `sample/basic/basic-set-file-reputation-example.js`
script as follows:

```sh
$ node sample/basic/basic-set-file-reputation-example.js
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

// Hashes for the file whose reputation should be set. These use the hashes for
// notepad.exe by default but could be replaced with appropriate values for the
// file whose reputation should be set.
var FILE_MD5 = 'f2c7bb8acc97f92e987a2d4087d021b1'
var FILE_SHA1 = '7eb0139d2175739b3ccb0d1110067820be6abd29'
var FILE_SHA256 = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  var tieClient = new TieClient(client)
  var hashes = {}
  hashes[HashType.MD5] = FILE_MD5
  hashes[HashType.SHA1] = FILE_SHA1
  hashes[HashType.SHA256] = FILE_SHA256

  // Set the Enterprise reputation for the file to Known Trusted
  tieClient.setFileReputation(
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
    hashes,
    'notepad.exe',
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

The enterprise-specific `trust level` is established for the file by invoking
the TieClient instance's
[setFileReputation()]{@link TieClient#setFileReputation} method, along with the 
`hash values` used to identify the file.

The `filename` and `comment` &mdash; "notepad.exe" and
"Reputation set via OpenDXL" in the above example, respectively &mdash; are
optional but are useful in identifying the particular file that is associated
with the hashes (especially if the file did not previously exist in the TIE
repository).
