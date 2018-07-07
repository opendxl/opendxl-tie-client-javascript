/**
 * @module FileGtiAttrib
 * @description Attributes associated with `file reputations` returned by
 * the Global Threat Intelligence (GTI) `reputation provider`.
 *
 * | Name              | Numeric | Description |
 * | ------------------| ------- | ----------- |
 * | FIRST_CONTACT     | 2101908 | The time the file was first seen (Epoch time). |
 * | PREVALENCE        | 2102421 | The number of times the file has been requested. |
 * | ORIGINAL_RESPONSE | 2120340 | The raw response as returned by the Global Threat Intelligence (GTI) `reputation provider`. |
 */

'use strict'

var GtiAttrib = require('./gti-attrib')

module.exports = {
  /**
   * The time the file was first seen (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  FIRST_CONTACT: '2101908',
  /**
   * The number of times the file has been requested.
   */
  PREVALENCE: '2102421',
  /**
   * The raw response as returned by the Global Threat Intelligence (GTI)
   * `reputation provider`.
   */
  ORIGINAL_RESPONSE: GtiAttrib.ORIGINAL_RESPONSE
}
