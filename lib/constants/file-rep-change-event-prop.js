/**
 * @module FileRepChangeEventProp
 * @description The standard set of properties that are included with a
 * `file reputation change event`. See the
 * {@link TieClient#addFileReputationChangeCallback} function for more
 * information about file reputation change events.
 *
 * | Name            | Description |
 * | --------------- | ----------- |
 * | HASHES          | A object of hashes that identify the file whose reputation has changed. |
 * | NEW_REPUTATIONS | The new `Reputations` for the file whose reputation has changed, as an object. |
 * | OLD_REPUTATIONS | The previous `Reputations` for the file whose reputation has changed, as an object. |
 * | UPDATE_TIME     | The time the reputation change occurred (Epoch time). |
 * | RELATIONSHIPS   | Contains information regarding the certificate associated with this file (if such a relationship exists). |
 */

'use strict'

var RepChangeEventProp = require('./rep-change-event-prop')

module.exports = {
  /**
   * A object of hashes that identify the certificate whose reputation has
   * changed. The `key` for each property is the `hash type` and the
   * corresponding `value` is the `hex` representation of the hash value. See
   * [HashType]{@link module:HashType} for the list of `hash type` constants.
   */
  HASHES: RepChangeEventProp.HASHES,
  /**
   * The new `Reputations` for the certificate whose reputation has changed, as
   * an object.
   */
  NEW_REPUTATIONS: RepChangeEventProp.NEW_REPUTATIONS,
  /**
   * The previous `Reputations` for the certificate whose reputation has
   * changed, as an object.
   */
  OLD_REPUTATIONS: RepChangeEventProp.OLD_REPUTATIONS,
  /**
   * The time the reputation change occurred (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  UPDATE_TIME: RepChangeEventProp.UPDATE_TIME,
  /**
   * Contains information regarding the certificate associated with this
   * file (if such a relationship exists).
   */
  RELATIONSHIPS: 'relationships'
}
