/**
 * @module FileEnterpriseAttrib
 */

'use strict'

var Buffer = require('safe-buffer').Buffer
var EnterpriseAttrib = require('./enterprise-attrib')

module.exports = {
  SERVER_VERSION: EnterpriseAttrib.SERVER_VERSION,
  FIRST_CONTACT: '2102165',
  PREVALENCE: '2101652',
  ENTERPRISE_SIZE: '2111893',
  MIN_LOCAL_REP: '2112148',
  MAX_LOCAL_REP: '2112404',
  AVG_LOCAL_REP: '2112660',
  PARENT_MIN_LOCAL_REP: '2112916',
  PARENT_MAX_LOCAL_REP: '2113172',
  PARENT_AVG_LOCAL_REP: '2113428',
  DETECTION_COUNT: '2113685',
  LAST_DETECTION_TIME: '2113942',
  IS_PREVALENT: '2123156',
  FILE_NAME_COUNT: '2114965',
  CHILD_FILE_REPS: '2138520',
  PARENT_FILE_REPS: '2138264',
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
  },
  toAggregateArray: function (aggregateAttrib) {
    var decodedAttrib = Buffer.from(aggregateAttrib, 'base64')
    var returnValue = []
    for (var i = 0; i < decodedAttrib.length; i += 2) {
      returnValue.push((decodedAttrib[i] + (256 * decodedAttrib[i + 1])))
    }
    if (returnValue[4] > 0) {
      returnValue[4] /= 100
    }
    return returnValue
  }
}
