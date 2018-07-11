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
