/**
 * @module RepChangeEventProp
 * @description The standard set of properties that are included with a
 * `reputation change event`.
 *
 * | Name            | Description |
 * | --------------- | ----------- |
 * | HASHES          | A object of hashes that identify the file or certificate whose reputation has changed. |
 * | NEW_REPUTATIONS | The new `Reputations` for the file or certificate whose reputation has changed, as an object. |
 * | OLD_REPUTATIONS | The previous `Reputations` for the file or certificate whose reputation has changed, as an object. |
 * | UPDATE_TIME     | The time the reputation change occurred (Epoch time). |
 */

'use strict'

module.exports = {
  /**
   * A object of hashes that identify the certificate whose reputation has
   * changed. The `key` for each property is the `hash type` and the
   * corresponding `value` is the `hex` representation of the hash value. See
   * [HashType]{@link module:HashType} for the list of `hash type` constants.
   */
  HASHES: 'hashes',
  /**
   * The new `Reputations` for the file or certificate whose reputation has
   * changed, as an object.
   */
  NEW_REPUTATIONS: 'newReputations',
  /**
   * The previous `Reputations` for the file or certificate whose reputation has
   * changed, as an object.
   */
  OLD_REPUTATIONS: 'oldReputations',
  /**
   * The time the reputation change occurred (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  UPDATE_TIME: 'updateTime'
}
