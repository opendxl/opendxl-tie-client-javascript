/**
 * @module EnterpriseAttrib
 * @description Attributes associated with `reputations` (for files and
 * certificates) returned by the Enterprise `reputation provider`.
 *
 * | Name           | Description |
 * | ---------------| ----------- |
 * | SERVER_VERSION | The version of the TIE server that returned the `reputations` (encoded version string). |
 * @private
 */

'use strict'

var Long = require('long')

module.exports = {
  /**
   * The version of the TIE server that returned the `reputations` (encoded
   * version string).
   *
   * See the [toVersionArray]{@link module:EnterpriseAttrib.toVersionArray}
   * and [toVersionString]{@link module:EnterpriseAttrib.toVersionString}
   * helper methods used to parse the encoded version string.
   */
  SERVER_VERSION: '2139285',
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
   * @param {String} versionAttrib - The encoded version string
   * @returns {Array<Number>} - An array corresponding to the specified
   *   encoded version string
   */
  toVersionArray: function (versionAttrib) {
    var versionAsLong = Long.fromString(versionAttrib)
    var versionHighBits = versionAsLong.getHighBitsUnsigned()
    return [((versionHighBits >>> 56) & 0xff),
      ((versionHighBits >>> 48) & 0xff),
      ((versionHighBits >>> 32) & 0xffff),
      versionAsLong.getLowBitsUnsigned()
    ]
  },
  /**
   * Returns a version string corresponding to the specified encoded version
   * string.
   *
   * For example, for a `versionAttrib` value of "73183493944770750", this would
   * return "1.4.0.190".
   * @param {String} versionAttrib - The encoded version string
   * @returns {String} - A version string corresponding to the specified encoded
   *   version string
   */
  toVersionString: function (versionAttrib) {
    return module.exports.toVersionArray(versionAttrib).join('.')
  }
}
