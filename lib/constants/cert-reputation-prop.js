/**
 * @module CertReputationProp
 * @description The standard set of properties that are included with each
 * `certificate reputation`.
 *
 * | Name        | Description |
 * | ------------| ----------- |
 * | PROVIDER_ID | The identifier of the particular `provider` that provided the reputation. |
 * | TRUST_LEVEL | The `trust level` for the certificate. |
 * | CREATE_DATE | The time this reputation was created (Epoch time). |
 * | ATTRIBUTES  | A provider-specific set of attributes associated with the reputation, as an object. |
 * | OVERRIDDEN  | Includes the list of files that are currently overriding the reputation of this certificate. The value associated with this property is an object containing the properties listed in the [CertReputationOverriddenProp]{@link module:CertReputationOverriddenProp} constants module. |
 */

'use strict'

var ReputationProp = require('./reputation-prop')

module.exports = {
  /**
   * The identifier of the particular `provider` that provided the reputation.
   *
   * See the [CertProvider]{@link module:CertProvider} constants module for the
   * list of `certificate reputation providers`.
   */
  PROVIDER_ID: ReputationProp.PROVIDER_ID,
  /**
   * The `trust level` for the certificate.
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
   * | [CertEnterpriseAttrib]{@link module:CertEnterpriseAttrib} | Attributes associated with the `Enterprise` reputation provider for certificates. |
   * | [CertGtiAttrib]{@link module:CertGtiAttrib}               | Attributes associated with the `Global Threat Intelligence (GTI)` reputation provider for certificates. |
   */
  ATTRIBUTES: ReputationProp.ATTRIBUTES,
  /**
   * Includes the list of files that are currently overriding the reputation of
   * this certificate.
   *
   * The value associated with this property is an object containing the
   * properties listed in the
   * [CertReputationOverriddenProp]{@link module:CertReputationOverriddenProp}
   * constants module.
   */
  OVERRIDDEN: 'overridden'
}
