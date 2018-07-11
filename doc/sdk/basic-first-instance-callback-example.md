This sample demonstrates registering a callback with the DXL fabric to receive
`first instance` events sent by the McAfee Threat Intelligence Exchange (TIE)
DXL service when are encountered for the first time within the local enterprise.

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

### Running

To run this sample execute the
`sample/basic/basic-first-instance-callback-example.js` script as follows:

```sh
$ node sample/basic/basic-first-instance-callback-example.js
```

The output should appear similar to the following:

```
Waiting for first instance events...
```

At this point the sample is listening for first instance events from the DXL
fabric.

### Execute New File

Execute a file that has not been previously seen within the local enterprise.

### Detection Output

After the file has executed the first instance information should appear within
the console that the sample is running (similar to the output below):

```
First instance on topic: /mcafee/event/tie/file/firstinstance
{
    "agentGuid": "{68125cd6-a5d8-11e6-348e-000c29663178}",
    "hashes": {
        "md5": "31dbe8cc443d2ca7fd236ac00a52fb17",
        "sha1": "2d6ca45061b7972312e00e5933fdff95bb90b61b",
        "sha256": "aa3c461d4c21a392e372d0d6ca4ceb1e4d88098d587659454eaf4d93c661880f"
    },
    "name": "MORPH.EXE"
}
```

The first line displays the DXL topic that the event was received on. In this
particular case it is, ``"/mcafee/event/tie/file/firstinstance"``, which
indicates that this is a file first instance event.

The following information is included in the `first instance` object:

  * System the first instance of the file was found on.
  * File information (file name and associated hashes).

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

  // Register first instance callback with the client
  tieClient.addFileFirstInstanceCallback(
    function (firstInstanceObj, originalEvent) {
      // Display the DXL topic that the event was received on
      console.log('First instance on topic: ' + originalEvent.destinationTopic)
      // Dump the first instance info
      console.log(MessageUtils.objectToJson(firstInstanceObj, true))
    }
  )

  // Wait forever
  console.log('Waiting for first instance events...')
})
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

Next, a call is made to the
[addFileFirstInstanceCallback()]{@link TieClient#addFileFirstInstanceCallback}
method to register a function to be invoked when first instance events occur.

When a new file is encountered within the local enterprise, the first instance
callback will display the topic that the event was received on. The first
instance details are printed by converting the `firstInstanceObj` object to JSON
with a call to the
[MessageUtils.objectToJson()](https://opendxl.github.io/opendxl-bootstrap-javascript/jsdoc/module-MessageUtils.html#.objectToJson)
method.
