/**
 * @module CertGtiAttrib
 * @description Attributes associated with `certificate reputations` returned by
 * the Global Threat Intelligence (GTI) `reputation provider`.
 *
 * | Name                  | Numeric | Description |
 * | --------------------- | ------- | ----------- |
 * | PREVALENCE            | 2108821 | The number of times the certificate has been requested. |
 * | FIRST_CONTACT         | 2109077 | The time the certificate was first seen (Epoch time). |
 * | REVOKED               | 2117524 | Whether the certificate has been revoked. |
 * | ORIGINAL_RESPONSE     | 2120340 | The raw response as returned by the Global Threat Intelligence (GTI) `reputation provider`. |
 */

'use strict'

var GtiAttrib = require('./gti-attrib')

module.exports = {
  /**
   * The number of times the certificate has been requested.
   */
  PREVALENCE: '2108821',
  /**
   * The time the certificate was first seen (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  FIRST_CONTACT: '2109077',
  /**
   * Whether the certificate has been revoked.
   */
  REVOKED: '2117524',
  /**
   * The raw response as returned by the Global Threat Intelligence (GTI)
   * `reputation provider`.
   */
  ORIGINAL_RESPONSE: GtiAttrib.ORIGINAL_RESPONSE
}
