'use strict'

var common = require('../common')
var dxl = common.require('@opendxl/dxl-client')
var tie = common.require('@opendxl/dxl-tie-client')
var EpochUtil = tie.EpochUtil
var FirstRefProp = tie.FirstRefProp
var TieClient = tie.TieClient

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

  // Get an array of systems that have referenced the certificate
  tieClient.getCertificateFirstReferences(
    function (error, systems) {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (error) {
        console.log('Error getting certificate references: ' + error.message)
      } else {
        // Display information for the systems which have referenced
        // the certificate
        console.log('\nSystems that have referenced the certificate:\n')
        systems.forEach(function (system) {
          console.log('\t' + system[FirstRefProp.SYSTEM_GUID] + ': ' +
            EpochUtil.toLocalTimeString(system[FirstRefProp.DATE])
          )
        })
      }
    },
    CERTIFICATE_BODY_SHA1,
    CERTIFICATE_PUBLIC_KEY_SHA1
  )
})
