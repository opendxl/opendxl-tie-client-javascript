'use strict'

var common = require('../common')
var dxl = common.require('@opendxl/dxl-client')
var tie = common.require('@opendxl/dxl-tie-client')
var EpochUtil = tie.EpochUtil
var FirstRefProp = tie.FirstRefProp
var HashType = tie.HashType
var TieClient = tie.TieClient

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

// Hashes for the file to lookup. These use the hashes for notepad.exe by
// default but could be replaced with appropriate values for the desired
// file to lookup.
var FILE_MD5 = 'f2c7bb8acc97f92e987a2d4087d021b1'
var FILE_SHA1 = '7eb0139d2175739b3ccb0d1110067820be6abd29'
var FILE_SHA256 = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Threat Intelligence Exchange (TIE) client
  var tieClient = new TieClient(client)

  var fileHashes = {}
  fileHashes[HashType.MD5] = FILE_MD5
  fileHashes[HashType.SHA1] = FILE_SHA1
  fileHashes[HashType.SHA256] = FILE_SHA256

  // Get an array of systems that have referenced the file
  tieClient.getFileFirstReferences(
    function (error, systems) {
      // Destroy the client - frees up resources so that the application
      // stops running
      client.destroy()
      if (error) {
        console.log('Error getting file references: ' + error.message)
      } else {
        // Display information for the systems which have referenced the file
        console.log('\nSystems that have referenced the file:\n')
        systems.forEach(function (system) {
          console.log('\t' + system[FirstRefProp.SYSTEM_GUID] + ': ' +
            EpochUtil.toLocalTimeString(system[FirstRefProp.DATE])
          )
        })
      }
    },
    fileHashes
  )
})
