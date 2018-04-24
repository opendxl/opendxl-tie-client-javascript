/**
 * @module EpochUtil
 * @private
 */

'use strict'

function pad (value) {
  var valueAsStr = value.toString()
  if (valueAsStr.length === 1) {
    valueAsStr = '0' + valueAsStr
  }
  return valueAsStr
}
module.exports = {
  toLocalTime: function (epochTime) {
    return new Date(epochTime * 1000)
  },
  toLocalTimeString: function (epochTime) {
    var localTime = module.exports.toLocalTime(epochTime)
    return localTime.getFullYear() + '-' + pad(localTime.getMonth() + 1) + '-' +
      pad(localTime.getDate()) + ' ' + pad(localTime.getHours()) + ':' +
      pad(localTime.getMinutes()) + ':' + pad(localTime.getSeconds())
  }
}
