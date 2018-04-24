/**
 * @module EnterpriseAttrib
 * @private
 */

'use strict'

var EpochUtil = require('./epoch-util')
var Long = require('long')

module.exports = {
  SERVER_VERSION: '2139285',
  toLocalTime: function (epochTime) {
    return EpochUtil.toLocalTime(epochTime)
  },
  toLocalTimeString: function (epochTime) {
    return EpochUtil.toLocalTimeString(epochTime)
  },
  toVersionArray: function (versionAttrib) {
    var versionAsLong = Long.fromString(versionAttrib)
    var versionHighBits = versionAsLong.getHighBitsUnsigned()
    return [((versionHighBits >>> 56) & 0xff),
      ((versionHighBits >>> 48) & 0xff),
      ((versionHighBits >>> 32) & 0xffff),
      versionAsLong.getLowBitsUnsigned()
    ]
  },
  toVersionString: function (versionAttrib) {
    return module.exports.toVersionArray(versionAttrib).join('.')
  }
}
