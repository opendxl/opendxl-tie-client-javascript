'use strict'

var common = require('../common')
var dxl = require('@opendxl/dxl-client')
var tie = common.requireTieClient()
var HashType = tie.HashType
var TieClient = tie.TieClient
var TrustLevel = tie.TrustLevel

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

var FILE_MD5 = 'f2c7bb8acc97f92e987a2d4087d021b1'
var FILE_SHA1 = '7eb0139d2175739b3ccb0d1110067820be6abd29'
var FILE_SHA256 = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  var tieClient = new TieClient(client)
  var hashes = {}
  hashes[HashType.MD5] = FILE_MD5
  hashes[HashType.SHA1] = FILE_SHA1
  hashes[HashType.SHA256] = FILE_SHA256
  tieClient.setFileReputation(
    function (error) {
      client.destroy()
      if (error) {
        console.log('Error: ' + error.message)
      } else {
        console.log('Succeeded')
      }
    },
    TrustLevel.KNOWN_TRUSTED,
    hashes,
    'notepad.exe',
    'Reputation set via OpenDXL'
  )
})
