/**
 * @module CertEnterpriseAttrib
 * @description Attributes associated with `certificate reputations` returned by
 * the Enterprise `reputation provider`.
 *
 * | Name                  | Numeric | Description |
 * | --------------------- | ------- | ----------- |
 * | FIRST_CONTACT         | 2109589 | The time the certificate was first seen (Epoch time). |
 * | PREVALENCE            | 2109333 | The count of unique systems that have executed a file that is associated with the certificate (via signing). |
 * | HAS_FILE_OVERRIDES    | 2122901 | Whether one or more files associated with the certificate is overriding its reputation. |
 * | IS_PREVALENT          | 2125972 | Whether the certificate is considered to be `prevalent` within the enterprise. |
 * | SERVER_VERSION        | 2139285 | The version of the TIE server that returned the `reputations` (encoded version string). |
 */

'use strict'

var EnterpriseAttrib = require('./enterprise-attrib')

module.exports = {
  /**
   * The time the certificate was first seen (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  FIRST_CONTACT: '2109589',
  /**
   * The count of unique systems that have executed a file that is associated
   * with the certificate (via signing).
   */
  PREVALENCE: '2109333',
  /**
   * Whether one or more files associated with the certificate is overriding its
   * reputation.
   */
  HAS_FILE_OVERRIDES: '2122901',
  /**
   * Whether the certificate is considered to be `prevalent` within the
   * enterprise.
   */
  IS_PREVALENT: '2125972',
  /**
   * The version of the TIE server that returned the `reputations` (encoded
   * version string).
   *
   * See the [toVersionArray]{@link module:CertEnterpriseAttrib.toVersionArray}
   * and [toVersionString]{@link module:CertEnterpriseAttrib.toVersionString}
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
   * var entRep = reputationsObj[CertProvider.ENTERPRISE]
   * var entRepAttribs = entRep[CertReputationProp.ATTRIBUTES]
   * var versionArray = CertEnterpriseAttrib.toVersionArray(
   *   entRepAttribs[CertEnterpriseAttrib.SERVER_VERSION])
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
   * var entRep = reputationsObj[CertProvider.ENTERPRISE]
   * var entRepAttribs = entRep[CertReputationProp.ATTRIBUTES]
   * var versionArray = CertEnterpriseAttrib.toVersionString(
   *   entRepAttribs[CertEnterpriseAttrib.SERVER_VERSION])
   * @param {String} versionAttrib - The encoded version string
   * @returns {String} - A version string corresponding to the specified encoded
   *   version string
   */
  toVersionString: function (versionAttrib) {
    return EnterpriseAttrib.toVersionString(versionAttrib)
  }
}
