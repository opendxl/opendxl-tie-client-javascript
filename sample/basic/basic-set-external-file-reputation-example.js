'use strict'

var crypto = require('crypto')

var common = require('../common')
var dxl = common.require('@opendxl/dxl-client')
var tie = common.require('@opendxl/dxl-tie-client')
var HashType = tie.HashType
var TieClient = tie.TieClient
var TrustLevel = tie.TrustLevel
var FileType = tie.FileType
var FileProvider = tie.FileProvider

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function () {
  var tieClient = new TieClient(client)
  // The trust level that the external provider wants to set to a specific file
  var externalTrustLevel = TrustLevel.KNOWN_TRUSTED

  // Hashes for the file whose reputation should be set. These use the hashes for
  // a random file "file.exe" by default but could be replaced with appropriate values for the
  // file whose reputation should be set.
  var randomValue = Math.random().toString(36).substr(2)
  var hashes = {}
  hashes[HashType.MD5] = crypto.createHash(HashType.MD5).update(randomValue).digest('hex') // FILE_MD5
  hashes[HashType.SHA1] = crypto.createHash(HashType.SHA1).update(randomValue).digest('hex') // FILE_MD5 // FILE_SHA1
  hashes[HashType.SHA256] = crypto.createHash(HashType.SHA256).update(randomValue).digest('hex') // FILE_MD5 // FILE_SHA256

  // Request reputation for file
  tieClient.getFileReputation(
    function (error, fileReputation) {
      if (error) {
        // Destroy the client - frees up resources so that the application
        // stops running
        client.destroy()
        console.error('Error getting file reputations: ' + error.message)
      } else {
        //
        // Check if there's any definitive reputation (different to Not Set [0] and Unknown [50])
        // for any provider except for External Provider (providerId=11)
        //
        var hasDefinitiveReputation = Object.values(fileReputation).some(function (r) {
          return r.trustLevel !== TrustLevel.NOT_SET &&
            r.trustLevel !== TrustLevel.UNKNOWN &&
            r.providerId !== FileProvider.EXTERNAL
        })

        if (hasDefinitiveReputation) {
          console.error('Abort: There is a reputation from another provider for the file, ' +
            'External Reputation is not necessary.')
          client.destroy()
        } else {
          tieClient.setExternalFileReputation(
            function () {
              // Destroy the client - frees up resources so that the application
              // stops running
              client.destroy()
              console.log('Event Sent')
            },
            externalTrustLevel,
            hashes,
            FileType.PEEXE,
            'file.exe',
            'External Reputation set via OpenDXL'
          )
        }
      }
    },
    hashes
  )
})
