'use strict'

var Buffer = require('safe-buffer').Buffer
var inherits = require('inherits')
var dxl = require('@opendxl/dxl-client')
var Request = dxl.Request
var bootstrap = require('@opendxl/dxl-bootstrap')
var Client = bootstrap.Client
var MessageUtils = bootstrap.MessageUtils

var CertProvider = require('./constants/cert-provider')
var CertRepChangeEventProp = require('./constants/cert-rep-change-event-prop')
var CertReputationProp = require('./constants/cert-reputation-prop')
var CertReputationOverriddenProp = require('./constants/cert-reputation-overridden-prop')
var DetectionEventProp = require('./constants/detection-event-prop')
var FileProvider = require('./constants/file-provider')
var FileRepChangeEventProp = require('./constants/file-rep-change-event-prop')
var FirstInstanceEventProp = require('./constants/first-instance-event-prop')
var HashType = require('./constants/hash-type')
var ReputationProp = require('./constants/reputation-prop')
var RepChangeEventProp = require('./constants/rep-change-event-prop')

var TIE_GET_FILE_REPUTATION_TOPIC = '/mcafee/service/tie/file/reputation'
var TIE_SET_FILE_REPUTATION_TOPIC = '/mcafee/service/tie/file/reputation/set'
var TIE_GET_FILE_FIRST_REFS_TOPIC = '/mcafee/service/tie/file/agents'
var TIE_GET_CERT_REPUTATION_TOPIC = '/mcafee/service/tie/cert/reputation'
var TIE_SET_CERT_REPUTATION_TOPIC = '/mcafee/service/tie/cert/reputation/set'
var TIE_GET_CERT_FIRST_REFS_TOPIC = '/mcafee/service/tie/cert/agents'

var TIE_EVENT_FILE_DETECTION_TOPIC = '/mcafee/event/tie/file/detection'
var TIE_EVENT_FILE_FIRST_INSTANCE_TOPIC = '/mcafee/event/tie/file/firstinstance'
var TIE_EVENT_FILE_REPUTATION_CHANGE_TOPIC = '/mcafee/event/tie/file/repchange/broadcast'
var TIE_EVENT_CERT_REPUTATION_CHANGE_TOPIC = '/mcafee/event/tie/cert/repchange/broadcast'

function base64ToHex (base64Value) {
  return Buffer.from(base64Value, 'base64').toString('hex')
}

function hexToBase64 (hexValue) {
  return Buffer.from(hexValue, 'hex').toString('base64')
}

function transformHashesForServer (obj, hashesKey) {
  obj.hashes = []
  Object.keys(hashesKey).forEach(function (type) {
    obj.hashes.push({type: type, value: hexToBase64(hashesKey[type])})
  })
  return obj
}

function transformHashesFromServer (obj, hashesKey) {
  var hashes = obj[hashesKey]
  if (hashes) {
    var newHashes = {}
    Object.keys(hashes).forEach(function (key) {
      var value = hashes[key]
      newHashes[value.type] = base64ToHex(value.value)
    })
    obj[hashesKey] = newHashes
  }
}

function transformReputations (reputations) {
  var returnValue = {}
  reputations.forEach(function (reputation) {
    returnValue[reputation[ReputationProp.PROVIDER_ID]] = reputation
    var overridden = reputation[CertReputationProp.OVERRIDDEN]
    if (overridden && overridden[CertReputationOverriddenProp.FILES]) {
      var overriddenFiles = overridden[CertReputationOverriddenProp.FILES]
      overriddenFiles.forEach(function (overriddenFile) {
        transformHashesFromServer(overriddenFile, 'hashes')
      })
    }
  })
  return returnValue
}

function transformChangedReputationPayload (repChangePayload) {
  transformHashesFromServer(repChangePayload, RepChangeEventProp.HASHES)
  var newReputations = repChangePayload[RepChangeEventProp.NEW_REPUTATIONS]
  if (newReputations) {
    repChangePayload[RepChangeEventProp.NEW_REPUTATIONS] =
      transformReputations(newReputations.reputations)
  }
  var oldReputations = repChangePayload[RepChangeEventProp.OLD_REPUTATIONS]
  if (oldReputations) {
    repChangePayload[RepChangeEventProp.OLD_REPUTATIONS] =
      transformReputations(oldReputations.reputations)
  }
  var relationships = repChangePayload[FileRepChangeEventProp.RELATIONSHIPS]
  if (relationships) {
    var certificate = relationships.certificate
    if (certificate) {
      transformHashesFromServer(certificate, 'hashes')
      if (certificate.publicKeySha1) {
        certificate.publicKeySha1 = base64ToHex(certificate.publicKeySha1)
      }
    }
  }
  if (repChangePayload[CertRepChangeEventProp.PUBLIC_KEY_SHA1]) {
    repChangePayload[CertRepChangeEventProp.PUBLIC_KEY_SHA1] =
      base64ToHex(repChangePayload[CertRepChangeEventProp.PUBLIC_KEY_SHA1])
  }
}

/**
 * The TIE client
 * @param dxlClient
 * @constructor
 */
function TieClient (dxlClient) {
  Client.call(this, dxlClient)

  this._addCallback = function (topic, transform, callback) {
    this._dxlClient.addEventCallback(topic, function (event) {
      var payload = MessageUtils.jsonPayloadToObject(event)
      transform(payload)
      callback(payload, event)
    })
  }

  this._getReputation = function (callback, topic, hashes, payload) {
    payload = payload || {}
    var request = new Request(topic)
    MessageUtils.objectToJsonPayload(request,
      transformHashesForServer(payload, hashes))
    this._dxlClient.asyncRequest(request, function (error, response) {
      var reputations = null
      if (response) {
        try {
          var responseObj = MessageUtils.jsonPayloadToObject(response)
          var reputationArr = responseObj.reputations
          reputations = reputationArr ? transformReputations(reputationArr) : {}
        } catch (err) {
          error = err
          reputations = null
        }
      }
      callback(error, reputations)
    })
  }

  this._setReputation = function (callback, topic, trustLevel, providerId,
                                  hashes, payload, comment) {
    if ((typeof trustLevel === 'undefined') || (trustLevel === null)) {
      throw new TypeError('trustLevel was not specified')
    }
    trustLevel = Number(trustLevel)
    if (isNaN(trustLevel)) {
      throw new TypeError('trustLevel was not a number')
    }
    payload = payload || {}
    comment = comment || ''
    var request = new Request(topic)
    payload.trustLevel = trustLevel
    payload.providerId = providerId
    payload.comment = comment
    transformHashesForServer(payload, hashes)
    MessageUtils.objectToJsonPayload(request, payload)
    this._dxlClient.asyncRequest(request, function (error) {
      if (callback) {
        callback(error)
      }
    })
  }

  this._getFirstReferences =
    function (callback, topic, hashes, payload, queryLimit) {
      payload = payload || {}
      if (typeof queryLimit === 'undefined') { queryLimit = 500 }
      var request = new Request(topic)
      payload.queryLimit = queryLimit
      transformHashesForServer(payload, hashes)
      MessageUtils.objectToJsonPayload(request, payload)
      this._dxlClient.asyncRequest(request, function (error, response) {
        var agents = null
        if (response) {
          try {
            var responseObj = MessageUtils.jsonPayloadToObject(response)
            agents = responseObj.agents || []
          } catch (err) {
            error = err
          }
        }
        callback(error, agents)
      })
    }
}

inherits(TieClient, Client)

TieClient.prototype.addFileDetectionCallback =
  function (detectionCallback) {
    this._addCallback(TIE_EVENT_FILE_DETECTION_TOPIC,
      function (payload) {
        transformHashesFromServer(payload, DetectionEventProp.HASHES)
      },
      detectionCallback)
  }

TieClient.prototype.removeFileDetectionCallback =
  function (detectionCallback) {
    this._dxlClient.addEventCallback(TIE_EVENT_FILE_DETECTION_TOPIC,
      detectionCallback)
  }

TieClient.prototype.addFileFirstInstanceCallback =
  function (firstInstanceCallback) {
    this._addCallback(TIE_EVENT_FILE_FIRST_INSTANCE_TOPIC,
      function (payload) {
        transformHashesFromServer(payload, FirstInstanceEventProp.HASHES)
      },
      firstInstanceCallback)
  }

TieClient.prototype.removeFileFirstInstanceCallback =
  function (firstInstanceCallback) {
    this._dxlClient.removeEventCallback(TIE_EVENT_FILE_FIRST_INSTANCE_TOPIC,
      firstInstanceCallback)
  }

TieClient.prototype.addFileReputationChangeCallback =
  function (repChangeCallback) {
    this._addCallback(TIE_EVENT_FILE_REPUTATION_CHANGE_TOPIC,
      transformChangedReputationPayload,
      repChangeCallback)
  }

TieClient.prototype.removeFileReputationChangeCallback =
  function (repChangeCallback) {
    this._dxlClient.addEventCallback(TIE_EVENT_FILE_REPUTATION_CHANGE_TOPIC,
      repChangeCallback)
  }

TieClient.prototype.addCertificateReputationChangeCallback =
  function (repChangeCallback) {
    this._addCallback(TIE_EVENT_CERT_REPUTATION_CHANGE_TOPIC,
      transformChangedReputationPayload,
      repChangeCallback)
  }

TieClient.prototype.removeCertificateReputationChangeCallback =
  function (detectionCallback) {
    this._dxlClient.removeEventCallback(TIE_EVENT_CERT_REPUTATION_CHANGE_TOPIC,
      detectionCallback)
  }

TieClient.prototype.getFileReputation =
  function (callback, hashes) {
    this._getReputation(callback, TIE_GET_FILE_REPUTATION_TOPIC, hashes)
  }

TieClient.prototype.setFileReputation =
  function (callback, trustLevel, hashes, filename, comment) {
    filename = filename || ''
    var payload = {filename: filename}
    this._setReputation(callback, TIE_SET_FILE_REPUTATION_TOPIC,
      trustLevel, FileProvider.ENTERPRISE, hashes, payload, comment)
  }

TieClient.prototype.getFileFirstReferences =
  function (callback, hashes, queryLimit) {
    this._getFirstReferences(callback, TIE_GET_FILE_FIRST_REFS_TOPIC, hashes,
      {}, queryLimit)
  }

TieClient.prototype.getCertificateReputation =
  function (callback, sha1, publicKeySha1) {
    var payload = publicKeySha1 ? {publicKeySha1: hexToBase64(publicKeySha1)} : {}
    var hashes = {}
    hashes[HashType.SHA1] = sha1
    this._getReputation(callback, TIE_GET_CERT_REPUTATION_TOPIC, hashes, payload)
  }

TieClient.prototype.setCertificateReputation =
  function (callback, trustLevel, sha1, publicKeySha1, comment) {
    var payload = publicKeySha1 ? {publicKeySha1: hexToBase64(publicKeySha1)} : {}
    var hashes = {}
    hashes[HashType.SHA1] = sha1
    this._setReputation(callback, TIE_SET_CERT_REPUTATION_TOPIC,
      trustLevel, CertProvider.ENTERPRISE, hashes, payload, comment)
  }

TieClient.prototype.getCertificateFirstReferences =
  function (callback, sha1, publicKeySha1, queryLimit) {
    var payload = publicKeySha1 ? {publicKeySha1: hexToBase64(publicKeySha1)} : {}
    var hashes = {}
    hashes[HashType.SHA1] = sha1
    this._getFirstReferences(callback, TIE_GET_CERT_FIRST_REFS_TOPIC, hashes,
      payload, queryLimit)
  }

module.exports = TieClient
