'use strict'

var common = require('../common')
var dxl = common.require('@opendxl/dxl-client')
var tie = common.require('@opendxl/dxl-tie-client')
var MessageUtils = common.require('@opendxl/dxl-bootstrap').MessageUtils
var HashType = tie.HashType
var TieClient = tie.TieClient
var TrustLevel = tie.TrustLevel

// Create DXL configuration from file
var config = dxl.Config.createDxlConfigFromFile(common.CONFIG_FILE)

// Create the client
var client = new dxl.Client(config)

// Hashes for the file whose reputation should be set. These use the hashes for
// notepad.exe by default but could be replaced with appropriate values for the
// file whose reputation should be set.
var FILE_MD5 = 'f2c7bb8acc97f92e987a2d4087d021b1'
var FILE_SHA1 = '7eb0139d2175739b3ccb0d1110067820be6abd29'
var FILE_SHA256 = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'

// Connect to the fabric, supplying a callback function which is invoked
// when the connection has been established
client.connect(function() {
    var tieClient = new TieClient(client)
        // The trust level that the external provider wants to set to a especific file
    var externalTrustLevel = TrustLevel.KNOWN_TRUSTED
    var hashes = {}
    hashes[HashType.MD5] = 'e872f1695c189c1efa656038073aa310' //FILE_MD5
    hashes[HashType.SHA1] = 'bd3987cd8242f4e50fb99b120f16be049ddb3685' //FILE_SHA1
    hashes[HashType.SHA256] = '84e97beb57b6410a5e8ba7871907a95b42dc78afef07e9da66ba1d8c05abffd3' //FILE_SHA256

    // Request reputation for notepad
    tieClient.getFileReputation(
        function(error, notepadReputation) {
            if (error) {
                // Destroy the client - frees up resources so that the application
                // stops running
                client.destroy()
                console.error('Error getting notepad reputations: ' + error.message)
            } else {
                var setReputation = true;
                // Display reputation for EICAR
                for (var i in notepadReputation) {
                    // It is only take into account the reputation of official providers and not the external provider's reputation
                    if (i != 11) {
                        // if the oficial providers do not have a reputation for the specified file or is unknown and the external reputation does not
                        // have conflicts with the oficial provider's reputation, then the reputation can be set
                        if (notepadReputation[i].trustLevel != 0 && notepadReputation[i].trustLevel != 50 && notepadReputation[i].trustLevel != externalTrustLevel) {
                            setReputation = false;
                        }
                    }
                }
                if (setReputation) {
                    tieClient.setExternalFileReputation(
                        function() {
                            // Destroy the client - frees up resources so that the application
                            // stops running
                            client.destroy();
                            console.log('Event Sent')
                        },
                        TrustLevel.KNOWN_TRUSTED,
                        18,
                        hashes,
                        'notepad.exe',
                        'Reputation set via OpenDXL'
                    )
                } else {
                    console.error('Error setting reputation: The reputation you try to set has conflicts with the current reputation');
                    client.destroy();
                }
            }
        },
        hashes
    )
})