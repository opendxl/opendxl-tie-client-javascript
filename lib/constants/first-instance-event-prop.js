/**
 * @module FirstInstanceEventProp
 * @description The standard set of properties that are included with a
 * `first instance event`. See the
 * {@link TieClient#addFileFirstInstanceCallback} function for more
 * information about first instance events.
 *
 * | Name        | Description |
 * | ------------| ----------- |
 * | SYSTEM_GUID | The identifier of the particular `provider` that provided the reputation. |
 * | HASHES      | A object of hashes that identify the file. |
 * | NAME        | The name of the file. |
 */

'use strict'

module.exports = {
  /**
   * The GUID of the system where the first instance of the file was found.
   */
  SYSTEM_GUID: 'agentGuid',
  /**
   * A object of hashes that identify the file. The `key` for each property is
   * the `hash type` and the corresponding `value` is the `hex` representation
   * of the hash value. See [HashType]{@link module:HashType} for the list of
   * `hash type` constants.
   */
  HASHES: 'hashes',
  /**
   * The name of the file.
   */
  NAME: 'name'
}
