/**
 * @module CertReputationProp
 */

'use strict'

var ReputationProp = require('./reputation-prop')

module.exports = {
  ATTRIBUTES: ReputationProp.ATTRIBUTES,
  CREATE_DATE: ReputationProp.CREATE_DATE,
  PROVIDER_ID: ReputationProp.PROVIDER_ID,
  TRUST_LEVEL: ReputationProp.TRUST_LEVEL,
  OVERRIDDEN: 'overridden'
}
