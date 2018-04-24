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
  var tieClient = new TieClient(client)
  tieClient.addFileDetectionCallback(function (detectionObj, originalEvent) {
    console.log('Detection on topic: ' + originalEvent.destinationTopic)
    console.log(MessageUtils.objectToJson(detectionObj, true))
  })
  console.log('Waiting for detection events...')
})
