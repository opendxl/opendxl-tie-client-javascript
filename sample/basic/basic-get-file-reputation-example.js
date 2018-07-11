'use strict'

var common = require('../common')
var dxl = require('@opendxl/dxl-client')
var tie = common.requireTieClient()
var HashType = tie.HashType
var TieClient = tie.TieClient
var MessageUtils = require('@opendxl/dxl-bootstrap').MessageUtils

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  // Create the McAfee Threat Intelligence Exchange (TIE) client
  var tieClient = new TieClient(client)

  var notepadHashes = {}
  notepadHashes[HashType.MD5] = 'f2c7bb8acc97f92e987a2d4087d021b1'
  notepadHashes[HashType.SHA1] = '7eb0139d2175739b3ccb0d1110067820be6abd29'
  notepadHashes[HashType.SHA256] = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

  // Request reputation for notepad.exe
  tieClient.getFileReputation(
    function (error, notepadReputations) {
      if (error) {
        // Destroy the client - frees up resources so that the application
        // stops running
        client.destroy()
        console.log('Error getting Notepad.exe reputations: ' + error.message)
      } else {
        // Display reputation for notepad.exe
        console.log('Notepad.exe reputations:')
        console.log(MessageUtils.objectToJson(notepadReputations, true) + '\n')

        var eicarHashes = {}
        eicarHashes[HashType.MD5] = '44d88612fea8a8f36de82e1278abb02f'
        eicarHashes[HashType.SHA1] = '3395856ce81f2b7382dee72602f798b642f14140'
        eicarHashes[HashType.SHA256] = '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f'

        // Request reputation for EICAR
        tieClient.getFileReputation(
          function (error, eicarReputations) {
            // Destroy the client - frees up resources so that the application
            // stops running
            client.destroy()
            if (error) {
              console.log('Error getting EICAR reputations: ' + error.message)
            } else {
              // Display reputation for EICAR
              console.log('EICAR reputations:')
              console.log(MessageUtils.objectToJson(eicarReputations, true))
            }
          },
          eicarHashes
        )
      }
    },
    notepadHashes
  )
})
