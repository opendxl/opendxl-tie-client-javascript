/**
 * @module CertRepChangeEventProp
 */

'use strict'

var RepChangeEventProp = require('./rep-change-event-prop')

module.exports = {
  HASHES: RepChangeEventProp.HASHES,
  NEW_REPUTATIONS: RepChangeEventProp.NEW_REPUTATIONS,
  OLD_REPUTATIONS: RepChangeEventProp.OLD_REPUTATIONS,
  UPDATE_TIME: RepChangeEventProp.UPDATE_TIME,
  PUBLIC_KEY_SHA1: 'publicKeySha1'
}
