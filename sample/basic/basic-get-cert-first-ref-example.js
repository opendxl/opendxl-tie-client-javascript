'use strict'

var common = require('../common')
var dxl = require('@opendxl/dxl-client')
var tie = common.requireTieClient()
var FirstRefProp = tie.FirstRefProp
var TieClient = tie.TieClient

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  var tieClient = new TieClient(client)

  tieClient.getCertificateFirstReferences(
    function (error, systems) {
      client.destroy()
      if (error) {
        console.log('Error getting certificate references: ' + error.message)
      } else {
        console.log('\nSystems that have referenced the certificate:\n')
        systems.forEach(function (system) {
          console.log('\t' + system[FirstRefProp.SYSTEM_GUID] + ': ' +
            FirstRefProp.toLocalTimeString(system[FirstRefProp.DATE])
          )
        })
      }
    },
    CERTIFICATE_BODY_SHA1,
    CERTIFICATE_PUBLIC_KEY_SHA1
  )
})
