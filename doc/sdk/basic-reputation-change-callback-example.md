This sample demonstrates registering a callback with the DXL fabric to receive
`reputation change` events sent by the McAfee Threat Intelligence Exchange (TIE)
DXL service when the `reputation` of a file or certificate changes.

### Prerequisites

* The samples configuration step has been completed (see {@tutorial samples}).
* A McAfee Threat Intelligence Exchange (TIE) Service is available on the DXL
  fabric.

### Running

To run this sample execute the
`sample/basic/basic-reputation-change-callback-example.js` script as follows:

```sh
$ node sample/basic/basic-reputation-change-callback-example.js
```

The output should appear similar to the following:

```
Waiting for reputation change events...
```

At this point the sample is listening for both file and certificate reputation
events from the DXL fabric.

### Force Reputation Change

The next step is to force a reputation change for a file or certificate via ePO.
The steps to accomplish this are listed below:

  * Open ePO and navigate to the `"TIE Reputations"` page.

  * Select the `"File Search"` or `"Certificate Search"` tab.

  * Select a `file` or `certificate` in the list.

  * Click the `"Actions"` button at the bottom left and select a new
    "Enterprise" reputation (for example, `Known Trusted`).

    * NOTE: It is safest to select a file (or certificate) that has a "GTI"
      Reputation of `Known Trusted` and simply set the "Enterprise" reputation
      to be the same (`Known Trusted`).

  * Remove the override by clicking on the `"Actions"` button again and
    selecting `"Remove Override"`.

### Reputation Change Output

After the reputation change has occurred the reputation change information
should appear within the console that the sample is running (similar to the
output below):

```
Reputation change on topic: /mcafee/event/tie/file/repchange/broadcast
{
    "hashes": {
        "md5": "f2c7bb8acc97f92e987a2d4087d01221",
        "sha1": "7eb0139d2175739b3ccb0d1110067820be6abd2b"
    },
    "newReputations": {
        "1": {
            "attributes": {
                "2120340": "0"
            },
            "createDate": 1480551590,
            "providerId": 1,
            "trustLevel": 0
        },
        "3": {
            "attributes": {
                "2101652": "0",
                "2102165": "1480551374",
                "2111893": "244",
                "2114965": "1",
                "2139285": "73183493944770750"
            },
            "createDate": 1480551374,
            "providerId": 3,
            "trustLevel": 99
        }
    },
    "oldReputations": {
        "1": {
            "attributes": {
                "2120340": "0"
            },
            "createDate": 1480551590,
            "providerId": 1,
            "trustLevel": 0
        },
        "3": {
            "attributes": {
                "2101652": "0",
                "2102165": "1480551374",
                "2111893": "244",
                "2114965": "1",
                "2139285": "73183493944770750"
            },
            "createDate": 1480551374,
            "providerId": 3,
            "trustLevel": 0
        }
    },
    "updateTime": 1481222923
}
```

The first line displays the DXL topic that the event was received on. In this
particular case it is "`/mcafee/event/tie/file/repchange/broadcast`", which
indicates that this is a `file` reputation change event.

The `reputation change` information is separated into 4 distinct sections:

  **Hash values**

  An array of hashes that identify the file or certificate whose reputation
  has changed.

  **New reputations**

  The new `Reputations` for the file or certificate whose reputation has
  changed, as an object.

  **Old reputations**

  The previous `Reputations` for the file or certificate whose reputation has
  changed, as an object.

  **Change time**

  The time the reputation change occurred.

### Details

The majority of the sample code is shown below:

```js
// Create the client
var client = new dxl.Client(config)

// Define the callback to receive reputation change events
var repChangeCallback = function (repChangeObj, originalEvent) {
  // Display the DXL topic that the event was received on
  console.log('Reputation change on topic: ' +
    originalEvent.destinationTopic)
  // Dump the reputation change info
  console.log(MessageUtils.objectToJson(repChangeObj, true))
}

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Threat Intelligence Exchange (TIE) client
  var tieClient = new TieClient(client)

  // Register callbacks with client to receive both file and certificate
  // reputation change events
  tieClient.addFileReputationChangeCallback(repChangeCallback)
  tieClient.addCertificateReputationChangeCallback(repChangeCallback)

  // Wait forever
  console.log('Waiting for reputation change events...')
})
```

A callback function, `repChangeCallback`, is defined for handling reputation
change events. When a reputation change event occurs, this function will display
the topic that the event was received on. The reputation change details are
printed by converting the `repChangeObj` object to JSON with a call to the
[MessageUtils.objectToJson()](https://opendxl.github.io/opendxl-bootstrap-javascript/jsdoc/module-MessageUtils.html#.objectToJson)
method.

Once a connection is established to the DXL fabric, the callback function
supplied to the DXL client instance's
[connect()](https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#connect)
method will be invoked. From within the callback function, a {@link TieClient}
instance is created. The TieClient instance will be used to communicate with the
TIE DXL services.

Next, a call is made to both the
[addFileReputationChangeCallback()]{@link TieClient#addFileReputationChangeCallback}
and
[addCertificateReputationChangeCallback()]{@link TieClient#addCertificateReputationChangeCallback}
methods to register the `repChangeCallback` function to be invoked when
file and certificate reputation change events occur.
