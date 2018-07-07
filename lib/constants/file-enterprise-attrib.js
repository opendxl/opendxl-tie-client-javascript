/**
 * @module FileEnterpriseAttrib
 * @description Attributes associated with `file reputations` returned by the
 * Enterprise `reputation provider`.
 *
 * | Name                  | Numeric | Description |
 * | --------------------- | ------- | ----------- |
 * | PREVALENCE            | 2101652 | The count of unique systems that have executed the file. |
 * | FIRST_CONTACT         | 2102165 | The time the file was first seen (Epoch time). |
 * | ENTERPRISE_SIZE       | 2111893 | The count of systems within the local enterprise. |
 * | MIN_LOCAL_REP         | 2112148 | The lowest reputation found locally on a system. |
 * | MAX_LOCAL_REP         | 2112404 | The highest reputation found locally on a system. |
 * | AVG_LOCAL_REP         | 2112660 | The average reputation found locally on systems. |
 * | PARENT_MIN_LOCAL_REP  | 2112916 | The lowest reputation for the parent found locally on a system. |
 * | PARENT_MAX_LOCAL_REP  | 2113172 | The highest reputation for the parent found locally on a system. |
 * | PARENT_AVG_LOCAL_REP  | 2113428 | The average reputation for the parent found locally on systems. |
 * | DETECTION_COUNT       | 2113685 | The count of detections for the file or certificate. |
 * | LAST_DETECTION_TIME   | 2113942 | The last time a detection occurred (Epoch time). |
 * | FILE_NAME_COUNT       | 2114965 | The count of unique file names for the file. |
 * | IS_PREVALENT          | 2123156 | Whether the file is considered to be `prevalent` within the enterprise. |
 * | PARENT_FILE_REPS      | 2138264 | The parent file reputations (aggregate string). |
 * | CHILD_FILE_REPS       | 2138520 | The child file reputations (aggregate string). |
 * | SERVER_VERSION        | 2139285 | The version of the TIE server that returned the `reputations` (encoded version string). |
 */

'use strict'

var Buffer = require('safe-buffer').Buffer
var EnterpriseAttrib = require('./enterprise-attrib')

module.exports = {
  /**
   * The count of unique systems that have executed the file.
   */
  PREVALENCE: '2101652',
  /**
   * The time the file was first seen (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  FIRST_CONTACT: '2102165',
  /**
   * The count of systems within the local enterprise.
   */
  ENTERPRISE_SIZE: '2111893',
  /**
   * The lowest reputation found locally on a system.
   */
  MIN_LOCAL_REP: '2112148',
  /**
   * The highest reputation found locally on a system.
   */
  MAX_LOCAL_REP: '2112404',
  /**
   * The average reputation found locally on systems.
   */
  AVG_LOCAL_REP: '2112660',
  /**
   * The lowest reputation for the parent found locally on a system.
   */
  PARENT_MIN_LOCAL_REP: '2112916',
  /**
   * The highest reputation for the parent found locally on a system.
   */
  PARENT_MAX_LOCAL_REP: '2113172',
  /**
   * The average reputation for the parent found locally on systems.
   */
  PARENT_AVG_LOCAL_REP: '2113428',
  /**
   * The count of detections for the file or certificate.
   */
  DETECTION_COUNT: '2113685',
  /**
   * The last time a detection occurred (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  LAST_DETECTION_TIME: '2113942',
  /**
   * The count of unique file names for the file.
   */
  FILE_NAME_COUNT: '2114965',
  /**
   * Whether the file is considered to be `prevalent` within the enterprise.
   */
  IS_PREVALENT: '2123156',
  /**
   * The parent file reputations (aggregate string).
   *
   * Use the
   * [toAggregateArray]{@link module:FileEnterpriseAttrib.toAggregateArray}
   * helper function to parse this attribute.
   */
  PARENT_FILE_REPS: '2138264',
  /**
   * The child file reputations (aggregate string).
   *
   * Use the
   * [toAggregateArray]{@link module:FileEnterpriseAttrib.toAggregateArray}
   * helper function to parse this attribute.
   */
  CHILD_FILE_REPS: '2138520',
  /**
   * The version of the TIE server that returned the `reputations` (encoded
   * version string).
   *
   * See the [toVersionArray]{@link module:FileEnterpriseAttrib.toVersionArray}
   * and [toVersionString]{@link module:FileEnterpriseAttrib.toVersionString}
   * helper methods used to parse the encoded version string.
   */
  SERVER_VERSION: EnterpriseAttrib.SERVER_VERSION,
  /**
   * Returns an array of version values corresponding to the specified encoded
   * version string. This method will return an array containing the server
   * version values in the following order:
   *
   * * The major version
   * * The minor version
   * * The patch version
   * * The build version
   *
   * For example, for a `versionAttrib` value of "73183493944770750", this
   * would return:
   *
   * ```js
   * [1, 4, 0, 190]
   * ```
   *
   * * Major version: 1
   * * Minor version: 4
   * * Patch version: 0
   * * Build version: 190
   *
   * @example
   * var entRep = reputationsObj[FileProvider.ENTERPRISE]
   * var entRepAttribs = entRep[FileReputationProp.ATTRIBUTES]
   * var versionArray = FileEnterpriseAttrib.toVersionArray(
   *   entRepAttribs[FileEnterpriseAttrib.SERVER_VERSION])
   * @param {String} versionAttrib - The encoded version string
   * @returns {Array<Number>} - An array corresponding to the specified
   *   encoded version string
   */
  toVersionArray: function (versionAttrib) {
    return EnterpriseAttrib.toVersionArray(versionAttrib)
  },
  /**
   * Returns a version string corresponding to the specified encoded version
   * string.
   *
   * For example, for a `versionAttrib` value of "73183493944770750", this would
   * return "1.4.0.190".
   *
   * @example
   * var entRep = reputationsObj[FileProvider.ENTERPRISE]
   * var entRepAttribs = entRep[FileReputationProp.ATTRIBUTES]
   * var versionArray = FileEnterpriseAttrib.toVersionString(
   *   entRepAttribs[FileEnterpriseAttrib.SERVER_VERSION])
   * @param {String} versionAttrib - The encoded version string
   * @returns {String} - A version string corresponding to the specified encoded
   *   version string
   */
  toVersionString: function (versionAttrib) {
    return EnterpriseAttrib.toVersionString(versionAttrib)
  },
  /**
   * Returns an array containing the values from the specified aggregate string.
   * This method will return an array containing the values that were in the
   * aggregate string in the following order:
   *
   * * The count of files
   * * The maximum `trust level` found across the files
   * * The minimum `trust level` found across the files
   * * The `trust level` for the last file
   * * The average `trust level` across the files
   *
   * For example, for a `aggregateAttrib` value of "AgBkADIAZABMHQ==", this
   * would return:
   *
   * ```js
   * [2, 100, 50, 100, 75]
   * ```
   * * Count of files: 2
   * * Maximum `trust level` found across the files: 100
   * * Minimum `trust level` found across the files: 50
   * * `Trust level` for the last file: 100
   * * Average `trust level` across the files: 75
   *
   * @example
   * var entRep = reputations_dict[FileProvider.ENTERPRISE]
   * var entRepAttribs = entRep[FileReputationProp.ATTRIBUTES]
   * var aggregateArray = FileEnterpriseAttrib.toAggregateArray(
   *   entRepAttribs[FileEnterpriseAttrib.CHILD_FILE_REPS])
   * @param {String} aggregateAttrib - The aggregate string
   * @returns {Array<Number>} - An array containing the values in the specified
   *   aggregate string.
   */
  toAggregateArray: function (aggregateAttrib) {
    var decodedAttrib = Buffer.from(aggregateAttrib, 'base64')
    var returnValue = []
    for (var i = 0; i < decodedAttrib.length; i += 2) {
      returnValue.push((decodedAttrib[i] + (256 * decodedAttrib[i + 1])))
    }
    if (returnValue[4] > 0) {
      returnValue[4] /= 100
    }
    return returnValue
  }
}
