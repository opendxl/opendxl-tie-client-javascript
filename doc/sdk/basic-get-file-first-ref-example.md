This sample demonstrates invoking the McAfee Threat Intelligence Exchange (TIE)
DXL service to retrieve the set of systems which have referenced (typically
executed) a file (as identified by hashes).

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

### Setup

Modify the example to include the hashes of the file you want to use for the
lookup.

```js
// Hashes for the file to lookup. These use the hashes for notepad.exe by
// default but could be replaced with appropriate values for the desired
// file to lookup.
var FILE_MD5 = 'f2c7bb8acc97f92e987a2d4087d021b1'
var FILE_SHA1 = '7eb0139d2175739b3ccb0d1110067820be6abd29'
var FILE_SHA256 = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'
```

This sample is equivalent to running the, `"Where Has File Run"` action in the
`"TIE Reputations"` page within ePO.

A simple way to determine a valid set of hashes to use with this sample is
detailed below:

  * Open ePO and navigate to the `"TIE Reputations"` page.
  * Select the `"File Search"` tab.
  * Select a `file` in the list.
  * Click the `"Actions"` button at the bottom left and select 
    `"Where Has File Run"`.
  * The `"Where Has File Run"` results page is displayed. The GUIDs associated
    with the systems in this list are what will be displayed when the sample is
    executed.
  * Close the `"Where Has File Run"` results.
  * Click on the same `file` to display its associated reputation information.
  * In the `"File Reputations Information"` page copy the `"MD5 Hash"`,
    `"SHA-1 Hash"`, and `"SHA-256 Hash"` values and paste them into the sample
    prior to running (as shown in the example above).

### Running

To run this sample execute the
`sample/basic/basic-get-file-first-ref-example.js` script as follows:

```sh
$ node sample/basic/basic-get-file-first-ref-example.js
```

The output should appear similar to the following:

```
Systems that have referenced the file:

        {3a6f574a-3e6f-436d-acd4-bcde336b054d}: 2016-10-07 13:54:52
        {d48d3d1a-915e-11e6-323a-000c2992f5d9}: 2016-10-12 16:57:54
        {68125cd6-a5d8-11e6-348e-000c29663178}: 2016-11-08 09:29:32
```

The sample outputs the GUIDs for systems that have referenced the file. The
first time each system referenced the file is also displayed.

### Details

The majority of the sample code is shown below:

```js
// Create the client
var client = new dxl.Client(config)

// Hashes for the file to lookup. These use the hashes for notepad.exe by
// default but could be replaced with appropriate values for the desired
// file to lookup.
var FILE_MD5 = 'f2c7bb8acc97f92e987a2d4087d021b1'
var FILE_SHA1 = '7eb0139d2175739b3ccb0d1110067820be6abd29'
var FILE_SHA256 = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Threat Intelligence Exchange (TIE) client
  var tieClient = new TieClient(client)

  var fileHashes = {}
  fileHashes[HashType.MD5] = FILE_MD5
  fileHashes[HashType.SHA1] = FILE_SHA1
  fileHashes[HashType.SHA256] = FILE_SHA256

  // Get an array of systems that have referenced the file
  tieClient.getFileFirstReferences(
    function (error, systems) {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (error) {
        console.log('Error getting file references: ' + error.message)
      } else {
        // Display information for the systems which have referenced the file
        console.log('\nSystems that have referenced the file:\n')
        systems.forEach(function (system) {
          console.log('\t' + system[FirstRefProp.SYSTEM_GUID] + ': ' +
            EpochUtil.toLocalTimeString(system[FirstRefProp.DATE])
          )
        })
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

Next, a call is made to the TieClient instance's
[getFileFirstReferences()]{@link TieClient#getFileFirstReferences}
method, along with the hash values that are used to identify the file.

On successful execution of the first references lookup, the second parameter
provided to the callback, `systems`, contains an array of systems. The `systems`
array is iterated, displaying the system's GUID along with the first time the
system referenced the file.
