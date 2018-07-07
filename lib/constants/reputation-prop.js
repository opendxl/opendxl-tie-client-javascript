/**
 * @module ReputationProp
 * @description The standard set of properties that are included with each
 * `reputation`.
 *
 * | Name        | Description |
 * | ------------| ----------- |
 * | PROVIDER_ID | The identifier of the particular `provider` that provided the reputation. |
 * | TRUST_LEVEL | The `trust level` for the reputation subject (file, certificate, etc.). |
 * | CREATE_DATE | The time this reputation was created (Epoch time). |
 * | ATTRIBUTES  | A provider-specific set of attributes associated with the reputation, as an object. |
 *
 * @private
 */

'use strict'

module.exports = {
  /**
   * The identifier of the particular `provider` that provided the reputation.
   */
  PROVIDER_ID: 'providerId',
  /**
   * The `trust level` for the reputation subject (file, certificate, etc.).
   */
  TRUST_LEVEL: 'trustLevel',
  /**
   * The time this reputation was created (Epoch time).
   */
  CREATE_DATE: 'createDate',
  /**
   * A provider-specific set of attributes associated with the reputation, as an object.
   */
  ATTRIBUTES: 'attributes'
}
