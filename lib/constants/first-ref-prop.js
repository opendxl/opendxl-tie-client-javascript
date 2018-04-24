/**
 * @module FirstRefProp
 */

'use strict'

var EpochUtil = require('./epoch-util')

module.exports = {
  DATE: 'date',
  SYSTEM_GUID: 'agentGuid',
  toLocalTime: function (epochTime) {
    return EpochUtil.toLocalTime(epochTime)
  },
  toLocalTimeString: function (epochTime) {
    return EpochUtil.toLocalTimeString(epochTime)
  }
}
