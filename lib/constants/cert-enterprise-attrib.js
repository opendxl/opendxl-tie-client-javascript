/**
 * @module CertEnterpriseAttrib
 */

'use strict'

var EnterpriseAttrib = require('./enterprise-attrib')

module.exports = {
  SERVER_VERSION: EnterpriseAttrib.SERVER_VERSION,
  FIRST_CONTACT: '2109589',
  HAS_FILE_OVERRIDES: '2122901',
  IS_PREVALENT: '2125972',
  PREVALENCE: '2109333',
  toLocalTime: function (epochTime) {
    return EnterpriseAttrib.toLocalTime(epochTime)
  },
  toLocalTimeString: function (epochTime) {
    return EnterpriseAttrib.toLocalTimeString(epochTime)
  },
  toVersionArray: function (versionAttrib) {
    return EnterpriseAttrib.toVersionArray(versionAttrib)
  },
  toVersionString: function (versionAttrib) {
    return EnterpriseAttrib.toVersionString(versionAttrib)
  }
}
