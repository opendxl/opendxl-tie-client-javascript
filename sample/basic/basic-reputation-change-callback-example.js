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

var repChangeCallback = function (repChangeObj, originalEvent) {
  console.log('Reputation change on topic: ' +
    originalEvent.destinationTopic)
  console.log(MessageUtils.objectToJson(repChangeObj, true))
}

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  var tieClient = new TieClient(client)
  tieClient.addFileReputationChangeCallback(repChangeCallback)
  tieClient.addCertificateReputationChangeCallback(repChangeCallback)
  console.log('Waiting for reputation change events...')
})
