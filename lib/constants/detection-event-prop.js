/**
 * @module DetectionEventProp
 * @description The standard set of properties that are included with a
 * `detection event`. See the {@link TieClient#addFileDetectionCallback}
 * function for more information about detection events.
 *
 * | Name               | Description |
 * | -------------------| ----------- |
 * | SYSTEM_GUID        | The GUID of the system that the detection occurred on. |
 * | HASHES             | A object of hashes that identify the file that triggered the detection. |
 * | DETECTION_TIME     | The time the detection occurred (Epoch time). |
 * | LOCAL_REPUTATION   | The local reputation determined for the file that triggered the detection. |
 * | NAME               | The name of the file that triggered the detection. |
 * | REMEDIATION_ACTION | A numeric value indicating the type of remediation that occurred in response to the detection. |
 */

'use strict'

module.exports = {
  /**
   * The GUID of the system that the detection occurred on.
   */
  SYSTEM_GUID: 'agentGuid',
  /**
   * A object of hashes that identify the file that triggered the detection. The
   * `key` for each property is the `hash type` and the corresponding `value` is
   * the `hex` representation of the hash value. See
   * [HashType]{@link module:HashType} for the list of `hash type` constants.
   */
  HASHES: 'hashes',
  /**
   * The time the detection occurred (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  DETECTION_TIME: 'detectionTime',
  /**
   * The local reputation determined for the file that triggered the detection.
   *
   * See the [TrustLevel]{@link module:TrustLevel} constants module for the
   * standard set of `trust levels`.
   */
  LOCAL_REPUTATION: 'localReputation',
  /**
   * The name of the file that triggered the detection.
   */
  NAME: 'name',
  /**
   * A numeric value indicating the type of remediation that occurred in
   * response to the detection.
   */
  REMEDIATION_ACTION: 'remediationAction'
}
