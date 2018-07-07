/**
 * @module FileProvider
 * @description Constants that are used to indicate the `provider` of a
 * particular `file reputation`.
 *
 * | Name       | Numeric | Description |
 * | -----------| ------- | ----------- |
 * | GTI        | 1       | Global Threat Intelligence (GTI). |
 * | ENTERPRISE | 3       | Enterprise reputation (specific to the local enterprise). |
 * | ATD        | 5       | McAfee Advanced Threat Defense (ATD). |
 * | MWG        | 7       | McAfee Web Gateway (MWG). |
 */

'use strict'

module.exports = {
  /**
   * Global Threat Intelligence (GTI).
   */
  GTI: 1,
  /**
   * Enterprise reputation (specific to the local enterprise).
   */
  ENTERPRISE: 3,
  /**
   * McAfee Advanced Threat Defense (ATD).
   */
  ATD: 5,
  /**
   * McAfee Web Gateway (MWG).
   */
  MWG: 7
}
