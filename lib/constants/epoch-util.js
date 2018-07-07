/**
 * @module EpochUtil
 * @description Helper module that provides utility methods for parsing
 * properties/attributes that contain Epoch times.
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
  /**
   * Converts the specified Epoch time to a `Date` (in local time).
   *
   * @example
   * var entRep = reputationsObj[FileProvider.ENTERPRISE]
   * var entRepAttribs = entRep[FileReputationProp.ATTRIBUTES]
   * var localTime = EpochUtil.toLocalTime(
   *   entRepAttribs[FileEnterpriseAttrib.FIRST_CONTACT])
   * @param {Number} epochTime - Time as an Epoch time
   * @returns {Date} - Time as a `Date` (in local time).
   */
  toLocalTime: function (epochTime) {
    return new Date(epochTime * 1000)
  },
  /**
   * Converts the specified Epoch time to a local time string.
   *
   * @example
   * var entRep = reputationsObj[FileProvider.ENTERPRISE]
   * var entRepAttribs = entRep[FileReputationProp.ATTRIBUTES]
   * var localTimeString = EpochUtil.toLocalTimeString(
   *   entRepAttribs[FileEnterpriseAttrib.FIRST_CONTACT])
   * @param {Number} epochTime - Time as an Epoch time
   * @returns {String} - Time as a string (in local time)
   */
  toLocalTimeString: function (epochTime) {
    var localTime = module.exports.toLocalTime(epochTime)
    return localTime.getFullYear() + '-' +
            pad(localTime.getMonth() + 1) + '-' +
            pad(localTime.getDate()) + ' ' + pad(localTime.getHours()) + ':' +
            pad(localTime.getMinutes()) + ':' + pad(localTime.getSeconds())
  }
}
