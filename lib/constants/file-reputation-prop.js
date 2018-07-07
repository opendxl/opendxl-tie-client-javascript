/**
 * @module FileReputationProp
 * @description The standard set of properties that are included with each
 * `file reputation`.
 *
 * | Name        | Description |
 * | ------------| ----------- |
 * | PROVIDER_ID | The identifier of the particular `provider` that provided the reputation. |
 * | TRUST_LEVEL | The `trust level` for the file. |
 * | CREATE_DATE | The time this reputation was created (Epoch time). |
 * | ATTRIBUTES  | A provider-specific set of attributes associated with the reputation, as an object. |
 */

'use strict'

var ReputationProp = require('./reputation-prop')

module.exports = {
  /**
   * The identifier of the particular `provider` that provided the reputation.
   *
   * See the [FileProvider]{@link module:FileProvider} constants module for the
   * list of `file reputation providers`.
   */
  PROVIDER_ID: ReputationProp.PROVIDER_ID,
  /**
   * The `trust level` for the file.
   */
  TRUST_LEVEL: ReputationProp.TRUST_LEVEL,
  /**
   * The time this reputation was created (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  CREATE_DATE: ReputationProp.CREATE_DATE,
  /**
   * A provider-specific set of attributes associated with the reputation,
   * as an object.
   *
   * | Module                                                    | Description |
   * | --------------------------------------------------------- | ----------- |
   * | [FileEnterpriseAttrib]{@link module:FileEnterpriseAttrib} | Attributes associated with the `Enterprise` reputation provider for files. |
   * | [FileGtiAttrib]{@link module:FileGtiAttrib}               | Attributes associated with the `Global Threat Intelligence (GTI)` reputation provider for files. |
   * | [AtdAttrib]{@link module:AtdAttrib}                       | Attributes associated with the `Advanced Threat Defense (ATD)` reputation provider. |
   */
  ATTRIBUTES: ReputationProp.ATTRIBUTES
}
