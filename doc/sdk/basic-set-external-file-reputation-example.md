This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to set the External Provider `trust level` of a file (as identified by its hashes).



### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).

* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

* The JavaScript DXL client must be authorized to send messages to the
  `/mcafee/event/external/file/report` topic, which is part of the 
  `TIE Server Set External Reputation` authorization group.

  The following page provides an example of authorizing a Python client to send
  messages to an `authorization group`. While the example is based on McAfee
  Active Response (MAR), the instructions are the same with the exception of
  swapping the `TIE Server Set External Reputation` `authorization group` in
  place of `Active Response Server API`:

  <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>

### Running

To run this sample execute the `sample/basic/basic-set-external-file-reputation-example.js`
script as follows:

```sh
$ node sample/basic/basic-set-external-file-reputation-example.js
```

If the `External Reputation` operation succeeds the following message will be
displayed:

```
Event Sent.
```

### Details

The majority of the sample code is shown below:

```js
var client = new dxl.Client(config)

// Hashes for the file whose reputation will be set.
var FILE_MD5 = '<FILE MD5>'
var FILE_SHA1 = '<FILE SHA1>'
var FILE_SHA256 = '<FILE SHA256>'


client.connect(function () {
  var tieClient = new TieClient(client)
  // The trust level that the external provider wants to set to a specific file
  var externalTrustLevel = TrustLevel.KNOWN_TRUSTED
  
  var hashes = {}
  hashes[HashType.MD5] = FILE_MD5
  hashes[HashType.SHA1] = FILE_SHA1
  hashes[HashType.SHA256] = FILE_SHA256

  // Request reputation for file
  tieClient.getFileReputation(
    function (error, fileReputation) {
      if (error) {
        // Destroy the client - frees up resources so that the application
        // stops running
        client.destroy()
        console.error('Error getting file reputations: ' + error.message)
      } else {
        //
        // Check if there's any definitive reputation (different to Not Set [0] and Unknown [50])
        // for any provider except for External Provider (providerId=15)
        //
        var hasDefinitiveReputation = Object.values(fileReputation).some(function (r) {
          return r.trustLevel !== TrustLevel.NOT_SET &&
            r.trustLevel !== TrustLevel.UNKNOWN &&
            r.providerId !== FileProvider.EXTERNAL
        })

        if (hasDefinitiveReputation) {
          console.error('Abort: There is a reputation from another provider for the file, ' +
            'External Reputation is not necessary.')
          client.destroy()
        } else {
          tieClient.setExternalFileReputation(
            function () {
              // Destroy the client - frees up resources so that the application
              // stops running
              client.destroy()
              console.log('Event Sent')
            },
            externalTrustLevel,
            hashes,
            FileType.PEEXE,
            'file.exe',
            'External Reputation set via OpenDXL'
          )
        }
      }
    },
    hashes
  )
})

```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

The External Reputation `trust level` is established for the file by invoking
the TieClient instance's
[setExternalFileReputation()]{@link TieClient#setExternalFileReputation} method, along with the 
`hash values` used to identify the file.

The `filename`, `filetype` and `comment` are
optional but useful in identifying the particular file that is associated
with the hashes (especially if the file did not previously exist in the TIE
repository).
