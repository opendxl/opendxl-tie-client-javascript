This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to retrieve the reputation of files (as identified by their hashes).

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

### Running

To run this sample execute the `sample/basic/basic-get-file-reputation-example.js`
script as follows:

```sh
$ node sample/basic/basic-get-file-reputation-example.js
```

The output should appear similar to the following:

```
Notepad.exe reputations:
{
    "1": {
        "attributes": {
            "2120340": "2139160704"
        },
        "createDate": 1480455704,
        "providerId": 1,
        "trustLevel": 99
    },
    "3": {
        "attributes": {
            "2101652": "233",
            "2102165": "1476902802",
            "2111893": "242",
            "2114965": "4",
            "2139285": "73183493944770750"
        },
        "createDate": 1476902802,
        "providerId": 3,
        "trustLevel": 99
    }
}

EICAR reputations:
{
    "1": {
        "attributes": {
            "2120340": "2139162632"
        },
        "createDate": 1480616574,
        "providerId": 1,
        "trustLevel": 1
    },
    "3": {
        "attributes": {
            "2101652": "120",
            "2102165": "1476902803",
            "2111893": "242",
            "2114965": "0",
            "2139285": "73183493944770750"
        },
        "createDate": 1476902803,
        "providerId": 3,
        "trustLevel": 0
    }
}
```

The sample outputs the file reputation for two files.

The `key` for each property in the object corresponds to a particular `provider`
of the associated `reputation`. The list of `file reputation providers` can be
found in the [FileProvider]{@link module:FileProvider} constants module.

The first file queried in the TIE service is “notepad.exe”. The McAfee Global
Threat Intelligence (GTI) service is identified in the results as
`"providerId" : 1`. The trust level associated with the GTI response
(`"trustLevel": 99`) indicates that the file is known good.

The second file queried in the TIE service is the 
“EICAR Standard Anti-Virus Test File”. The trust level associated with the GTI
response (`"trustLevel": 1`) indicates that the file is known bad.

See the [TrustLevel]{@link module:TrustLevel} constants module for the list of
standard trust levels.

### Details

The majority of the sample code is shown below:

```js
// Create the client
var client = new dxl.Client(config)

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Threat Intelligence Exchange (TIE) client
  var tieClient = new TieClient(client)

  var notepadHashes = {}
  notepadHashes[HashType.MD5] = 'f2c7bb8acc97f92e987a2d4087d021b1'
  notepadHashes[HashType.SHA1] = '7eb0139d2175739b3ccb0d1110067820be6abd29'
  notepadHashes[HashType.SHA256] = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

  // Request reputation for notepad.exe
  tieClient.getFileReputation(
    function (error, notepadReputations) {
      if (error) {
        // Destroy the client - frees up resources so that the application
        // stops running
        client.destroy()
        console.log('Error getting Notepad.exe reputations: ' + error.message)
      } else {
        // Display reputation for notepad.exe
        console.log('Notepad.exe reputations:')
        console.log(MessageUtils.objectToJson(notepadReputations, true) + '\n')

        var eicarHashes = {}
        eicarHashes[HashType.MD5] = '44d88612fea8a8f36de82e1278abb02f'
        eicarHashes[HashType.SHA1] = '3395856ce81f2b7382dee72602f798b642f14140'
        eicarHashes[HashType.SHA256] = '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f'

        // Request reputation for EICAR
        tieClient.getFileReputation(
          function (error, eicarReputations) {
            // Destroy the client - frees up resources so that the application
            // stops running
            client.destroy()
            if (error) {
              console.log('Error getting EICAR reputations: ' + error.message)
            } else {
              // Display reputation for EICAR
              console.log('EICAR reputations:')
              console.log(MessageUtils.objectToJson(eicarReputations, true))
            }
          },
          eicarHashes
        )
      }
    },
    notepadHashes
  )
})
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

For each file whose reputations are retrieved, a call is made to the
TieClient instance's [getFileReputation()]{@link TieClient#getFileReputation}
method, along with the hash values that are used to identify the file.

On successful execution of the reputation lookup, the second parameter provided
to the callback &mdash; `notepadReputations` / `eicarReputations` &mdash;
contains the reputations. The reputations are printed by converting the
response object to JSON with a call to the
[MessageUtils.objectToJson()](https://opendxl.github.io/opendxl-bootstrap-javascript/jsdoc/module-MessageUtils.html#.objectToJson)
method.
