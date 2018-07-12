This sample demonstrates registering a callback with the DXL fabric to receive
`detection` events sent by the McAfee Threat Intelligence Exchange (TIE)
DXL service when `detections` occur on managed systems.

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

### Running

To run this sample execute the
`sample/basic/basic-detection-callback-example.js` script as follows:

```sh
$ node sample/basic/basic-detection-callback-example.js
```

The output should appear similar to the following:

```
Waiting for detection events...
```

At this point the sample is listening for detection events from the DXL fabric.

### Force Detection

The actual steps to force a detection are outside the scope of this client
library. However, the following guidelines might prove useful:

  * Select a test executable file that is not covered by a certificate.
  * Make a backup of the test file (it may be cleaned depending on the current
    action enforcement policy).
  * Ensure your reputation thresholds are properly configured in policy.
  * Set the reputation for the test executable within the `TIE Reputations` page
    so that a detection will occur.

### Reputation Change Output

After the reputation change has occurred the reputation change information
should appear within the console that the sample is running (similar to the
output below):

### Detection Output

After the detection has occurred the detection information should appear within
the console that the sample is running (similar to the output below):

```
Detection on topic: /mcafee/event/tie/file/detection
{
    "agentGuid": "{68125cd6-a5d8-11e6-348e-000c29663178}",
    "detectionTime": 1481301796,
    "hashes": {
        "md5": "eb5e2b9dc51817a086d7b97eb52410ab",
        "sha1": "435dfd470f727437c7cb4f07cba1f9a1f4272656",
        "sha256": "414bb16b10ece2db2d8448cb9f313f80cb77c310ca0c19ee03c73cba0c16fedb"
    },
    "localReputation": 1,
    "name": "FOCUS_MALWARE2.EXE",
    "remediationAction": 5
}
```

The first line displays the DXL topic that the event was received on. In this
particular case it is "`/mcafee/event/tie/file/detection`", which indicates that
this is a `file` detection event.

The following information is included in the `detection` object:

  * System the detection occurred on.
  * Time the detection occurred (Epoch time).
  * File that triggered the detection (file name and associated hashes).
  * Reputation value that was calculated locally which triggered the detection.
  * Remediation action that occurred in response to the detection.

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

  // Register detection callback with the client
  tieClient.addFileDetectionCallback(function (detectionObj, originalEvent) {
    // Display the DXL topic that the event was received on
    console.log('Detection on topic: ' + originalEvent.destinationTopic)
    // Dump the detection info
    console.log(MessageUtils.objectToJson(detectionObj, true))
  })

  // Wait forever
  console.log('Waiting for detection events...')
})
```

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

Next, a call is made to the TieClient instance's
[addFileDetectionCallback()]{@link TieClient#addFileDetectionCallback}
method to register a function to be invoked when detection events occur.

When a detection event occurs, the detection callback will display the topic
that the event was received on. The detection details are printed by converting
the `detectionObj` object to JSON with a call to the
[MessageUtils.objectToJson()](https://opendxl.github.io/opendxl-bootstrap-javascript/jsdoc/module-MessageUtils.html#.objectToJson)
method.
