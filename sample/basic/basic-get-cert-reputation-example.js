'use strict'

var common = require('../common')
var dxl = require('@opendxl/dxl-client')
var tie = common.requireTieClient()
var TieClient = tie.TieClient
var MessageUtils = require('@opendxl/dxl-bootstrap').MessageUtils

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

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

  // Request reputation for the certificate
  tieClient.getCertificateReputation(
    function (error, reputations) {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (error) {
        console.log('Error getting certificate reputations: ' + error.message)
      } else {
        // Display reputation for the certificate
        console.log('Certificate reputations:')
        console.log(MessageUtils.objectToJson(reputations, true))
      }
    },
    CERTIFICATE_BODY_SHA1,
    CERTIFICATE_PUBLIC_KEY_SHA1
  )
})
