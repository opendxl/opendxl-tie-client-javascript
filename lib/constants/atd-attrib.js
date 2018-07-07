/**
 * @module AtdAttrib
 * @description Attributes associated with `file reputations` returned by the
 * Advanced Threat Defense (ATD) `reputation provider`.
 *
 * | Name            | Numeric | Description |
 * | --------------- | ------- | ----------- |
 * | GAM_SCORE       | 4194962 | The `trust score` reported by the Gateway Anti-Malware (GAM). |
 * | AV_ENGINE_SCORE | 4195218 | The `trust score` reported by the Anti-Virus engine. |
 * | SANDBOX_SCORE   | 4195474 | The `trust score` as a result of the sandbox evaluation. |
 * | VERDICT         | 4195730 | The overall verdict (taking into consideration all available information). |
 * | BEHAVIORS       | 4197784 | An encoded structure that contains observed behaviors of the file.
 */

'use strict'

module.exports = {
  /**
   * The `trust score` reported by the Gateway Anti-Malware (GAM).
   *
   * See the [AtdTrustLevel]{@link module:AtdTrustLevel} constants module for
   * the list of ATD `trust levels`.
   */
  GAM_SCORE: '4194962',
  /**
   * The `trust score` reported by the Anti-Virus engine.
   *
   * See the [AtdTrustLevel]{@link module:AtdTrustLevel} constants module for
   * the list of ATD `trust levels`.
   */
  AV_ENGINE_SCORE: '4195218',
  /**
   * The `trust score` as a result of the sandbox evaluation.
   *
   * See the [AtdTrustLevel]{@link module:AtdTrustLevel} constants module for
   * the list of ATD `trust levels`.
   */
  SANDBOX_SCORE: '4195474',
  /**
   * The overall verdict (taking into consideration all available information).
   *
   * See the [AtdTrustLevel]{@link module:AtdTrustLevel} constants module for
   * the list of ATD `trust levels`.
   */
  VERDICT: '4195730',
  /**
   * An encoded structure that contains observed behaviors of the file.
   */
  BEHAVIORS: '4197784'
}
