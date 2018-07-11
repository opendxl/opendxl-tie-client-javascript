'use strict'

var common = require('../common')
var dxl = require('@opendxl/dxl-client')
var MessageUtils = require('@opendxl/dxl-bootstrap').MessageUtils
var tie = common.requireTieClient()
var TieClient = tie.TieClient

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

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
