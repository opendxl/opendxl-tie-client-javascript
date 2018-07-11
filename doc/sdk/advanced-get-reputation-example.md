This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to retrieve the reputation a file and certificate (as identified by
their hashes). Further, this example demonstrates using the constants modules
&mdash; for example, [FileEnterpriseAttrib]{@link module:FileEnterpriseAttrib}
and [CertEnterpriseAttrib]{@link module:CertEnterpriseAttrib} &mdash; to
examine specific fields within the reputation responses.

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

### Running

To run this sample execute the `sample/basic/advanced-get-reputation-example.js`
script as follows:

```sh
$ node sample/basic/advanced-get-reputation-example.js
```

The output should appear similar to the following:

```
File reputation response:
    Global Threat Intelligence (GTI) trust level: 99
    Enterprise prevalence: 242
    First contact: 2016-10-19 11:46:42

Full file reputation response:
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
            "2101652": "242",
            "2102165": "1476902802",
            "2111893": "251",
            "2114965": "4",
            "2139285": "73183493944770750"
        },
        "createDate": 1476902802,
        "providerId": 3,
        "trustLevel": 99
    }
}

Certificate reputation response:
    Global Threat Intelligence (GTI) trust level: 99
    Enterprise prevalence: 12
    First contact: 2016-10-12 17:28:34

Full certificate reputation response:
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

The sample outputs the reputation information for a file and a certificate.

In addition to dumping all of the reputation information received, this sample
pulls out three specific properties for the file and certificate:

  * The Global Threat Intelligence (GTI) trust level.
  * The prevalence of the file or certificate within the enterprise.
  * The first time the file or certificate was found within the enterprise.

### Details

The majority of the sample code is shown below:

```js
// Create the client
var client = new dxl.Client(config)

// Hashes for the file to look up (notepad.exe)
// These can be replaced by a file which is known to have run within the
// enterprise for better results
var FILE_MD5 = 'f2c7bb8acc97f92e987a2d4087d021b1'
var FILE_SHA1 = '7eb0139d2175739b3ccb0d1110067820be6abd29'
var FILE_SHA256 = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

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

  var fileHashes = {}
  fileHashes[HashType.MD5] = FILE_MD5
  fileHashes[HashType.SHA1] = FILE_SHA1
  fileHashes[HashType.SHA256] = FILE_SHA256

  // Perform the file reputation query
  tieClient.getFileReputation(
    function (fileReputationError, fileReputations) {
      if (fileReputationError) {
        // Destroy the client - frees up resources so that the application
        // stops running
        client.destroy()
        console.log('Error getting file reputations: ' +
          fileReputationError.message)
      } else {
        console.log('File reputation response:')

        // Display the Global Threat Intelligence (GTI) trust level for the file
        var fileGtiRep = fileReputations[FileProvider.GTI]
        if (fileGtiRep) {
          console.log('\tGlobal Threat Intelligence (GTI) trust level: ' +
            fileGtiRep[FileReputationProp.TRUST_LEVEL])
        }

        // Display the Enterprise reputation information
        var fileEntRep = fileReputations[FileProvider.ENTERPRISE]
        if (fileEntRep) {
          // Retrieve the enterprise reputation attributes
          var entRepAttribs = fileEntRep[FileReputationProp.ATTRIBUTES]

          // Display prevalence (if it exists)
          var prevalenceAttrib = entRepAttribs[FileEnterpriseAttrib.PREVALENCE]
          if (prevalenceAttrib) {
            console.log('\tEnterprise prevalence: ' + prevalenceAttrib)
          }

          // Display first contact date (if it exists)
          var firstContactAttrib =
            entRepAttribs[FileEnterpriseAttrib.FIRST_CONTACT]
          if (firstContactAttrib) {
            console.log('\tFirst contact: ' +
              EpochUtil.toLocalTimeString(firstContactAttrib))
          }
        }

        // Display the full file reputation response
        console.log('\nFull file reputation response:\n' +
          MessageUtils.objectToJson(fileReputations, true) + '\n')

        // Perform the certificate reputation query
        tieClient.getCertificateReputation(
          function (certReputationError, certReputations) {
            // Destroy the client - frees up resources so that the application
            // stops running
            client.destroy()
            if (certReputationError) {
              console.log('Error getting certificate reputations: ' +
                certReputationError.message)
            } else {
              console.log('Certificate reputation response:')

              // Display the Global Threat Intelligence(GTI) trust level for the
              // certificate
              var certGtiRep = certReputations[CertProvider.GTI]
              if (certGtiRep) {
                console.log('\tGlobal Threat Intelligence (GTI) trust level: ' +
                  certGtiRep[CertReputationProp.TRUST_LEVEL])
              }

              // Display the Enterprise reputation information
              var certEntRep = certReputations[CertProvider.ENTERPRISE]
              if (certEntRep) {
                // Retrieve the enterprise reputation attributes
                var entRepAttribs = certEntRep[CertReputationProp.ATTRIBUTES]

                // Display prevalence (if it exists)
                var prevalenceAttrib =
                  entRepAttribs[CertEnterpriseAttrib.PREVALENCE]
                if (prevalenceAttrib) {
                  console.log('\tEnterprise prevalence: ' + prevalenceAttrib)
                }

                // Display first contact date (if it exists)
                var firstContactAttrib =
                  entRepAttribs[CertEnterpriseAttrib.FIRST_CONTACT]
                if (firstContactAttrib) {
                  console.log('\tFirst contact: ' +
                    EpochUtil.toLocalTimeString(firstContactAttrib))
                }
              }

              // Display the full certificate response
              console.log('\nFull certificate reputation response:\n' +
                MessageUtils.objectToJson(certReputations, true))
            }
          },
          CERTIFICATE_BODY_SHA1,
          CERTIFICATE_PUBLIC_KEY_SHA1
        )
      }
    },
    fileHashes
  )
})
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

To request the reputation of the file, a call is made to the TieClient
instance's [getFileReputation()]{@link TieClient#getFileReputation}
method, along with the hash values that are used to identify the file.

To request the reputation of the certificate, a call is made to the TieClient
instance's
[getCertificateReputation()]{@link TieClient#getCertificateReputation}
method, along with the hash values that are used to identify the certificate.

On successful execution of the reputation lookups, the second parameter provided
to the callbacks &mdash; `fileReputations` / `certReputations` &mdash;
contains the reputations. The constants modules &mdash; for example,
[FileEnterpriseAttrib]{@link module:FileEnterpriseAttrib} and
[CertEnterpriseAttrib]{@link module:CertEnterpriseAttrib} &mdash; are used to
examine specific fields within the reputation responses.
