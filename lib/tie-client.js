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
var TrustLevel = require('./constants/trust-level')
var FileType = require('./constants/file-type')

// Topic used to retrieve the reputation of a file
var TIE_GET_FILE_REPUTATION_TOPIC = '/mcafee/service/tie/file/reputation'
// Topic used to set the reputation of a file
var TIE_SET_FILE_REPUTATION_TOPIC = '/mcafee/service/tie/file/reputation/set'
// Topic used to retrieve systems that have referenced the file
var TIE_GET_FILE_FIRST_REFS_TOPIC = '/mcafee/service/tie/file/agents'
// Topic used to retrieve the reputation of a certificate
var TIE_GET_CERT_REPUTATION_TOPIC = '/mcafee/service/tie/cert/reputation'
// Topic used to set the reputation of a certificate
var TIE_SET_CERT_REPUTATION_TOPIC = '/mcafee/service/tie/cert/reputation/set'
// Topic used to retrieve systems that have referenced the certificate
var TIE_GET_CERT_FIRST_REFS_TOPIC = '/mcafee/service/tie/cert/agents'

// Topic used to notify that a file detection has occurred
var TIE_EVENT_FILE_DETECTION_TOPIC = '/mcafee/event/tie/file/detection'
// Topic used to notify when the first instance of a file has been found
var TIE_EVENT_FILE_FIRST_INSTANCE_TOPIC = '/mcafee/event/tie/file/firstinstance'
// Topic used to notify that a file reputation has changed
var TIE_EVENT_FILE_REPUTATION_CHANGE_TOPIC = '/mcafee/event/tie/file/repchange/broadcast'
// Topic used to notify that a certificate reputation has changed
var TIE_EVENT_CERT_REPUTATION_CHANGE_TOPIC = '/mcafee/event/tie/cert/repchange/broadcast'
// Topic used by an External Reputation Provider to report a file reputation
var EVENT_TOPIC_EXTERNAL_FILE_REPORT = '/mcafee/event/external/file/report'

// Default maximum number of results to use for first references queries
var DEFAULT_QUERY_LIMIT = 500

/**
 * @classdesc Responsible for all communication with the
 * Data Exchange Layer (DXL) fabric.
 * @external DxlClient
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html}
 */

/**
 * @classdesc Event messages are sent using the
 * [sendEvent]{@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html#sendEvent} method of a client
 * instance.
 * @external Event
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Event.html}
 */

/**
 * Converts from a base64 value to a hex string
 * @param {String} base64Value - The base64 value
 * @returns {String} The corresponding hex string
 * @private
 */
function base64ToHex (base64Value) {
  return Buffer.from(base64Value, 'base64').toString('hex')
}

/**
 * Converts from a hex string to a base64 string
 * @param {String} hexValue - The hex value
 * @returns {String} The corresponding base64 string
 * @private
 */
function hexToBase64 (hexValue) {
  return Buffer.from(hexValue, 'hex').toString('base64')
}

/**
 * Transforms an object containing properties where the key is a hash type
 * and the value is a corresponding hash value into the standard TIE format for
 * hashes - where each hash in a separate object in an array with the hash
 * type and value in separate object properties.
 *
 * For example, this would translate
 *
 * ```js
 * {
 *   md5: 'eb5e2b9dc51817a086d7b97eb52410ab',
 *   sha1: '435dfd470f727437c7cb4f07cba1f9a1f4272656'
 * }
 * ```
 *
 * to:
 *
 * ```js
 * [
 *   {
 *     type: 'md5',
 *     value: 'eb5e2b9dc51817a086d7b97eb52410ab'
 *   },
 *   {
 *     type: 'sha1',
 *     value: '435dfd470f727437c7cb4f07cba1f9a1f4272656'
 *   }
 * ]
 * ```
 * @param {Object} obj - Object containing an object of hash properties to
 *   transform.
 * @param {String} hashesKey - Name of the key in the `obj` which contains the
 *   object of hash properties to transform.
 * @returns {Object} The value for `obj` with the hashes under the `hashesKey`
 *   key having been transformed.
 * @private
 */
function transformHashesForServer (obj, hashesKey) {
  obj.hashes = []
  Object.keys(hashesKey).forEach(function (type) {
    obj.hashes.push({type: type, value: hexToBase64(hashesKey[type])})
  })
  return obj
}

/**
 * Transforms an array of hashes in standard TIE format to a simplified form
 * that is an object where the hash type is the key.
 *
 * For example, this would translate
 *
 * ```js
 * [
 *   {
 *     type: 'md5',
 *     value: 'eb5e2b9dc51817a086d7b97eb52410ab'
 *   },
 *   {
 *     type: 'sha1',
 *     value: '435dfd470f727437c7cb4f07cba1f9a1f4272656'
 *   }
 * ]
 * ```
 *
 * to
 *
 * ```js
 * {
 *   md5: 'eb5e2b9dc51817a086d7b97eb52410ab',
 *   sha1: '435dfd470f727437c7cb4f07cba1f9a1f4272656'
 * }
 * ```
 *
 * @param {Object} obj - Object containing the array of hashes to transform.
 * @param {String} hashesKey - Name of the key in the `obj` which contains
 *   the array of hashes to transform.
 * @returns {Object} The value for `obj` with the hashes under the `hashesKey`
 *   key having been transformed.
 * @private
 */
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

/**
 * Transforms the specified object of reputations from the standard TIE format
 * to a simplified form (hex vs base64 hashes, etc.).
 * @param {Object} reputations - Object of reputations in the standard TIE
 *   format.
 * @returns {Object} The object of reputations in a simplified form.
 * @private
 */
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

/**
 * Transforms the payload received from TIE for a file or certificate reputation
 * change event into a simplified form (hex vs base64 hashes, etc.).
 * @param {Object} repChangePayload - Payload received in a reputation changed
 *   event.
 * @returns {Object} - Value for the `repChangePayload` parameter with
 *   subordinate objects changed into a simplified form.
 * @private
 */
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
 * @classdesc This client provides a high level wrapper for communicating with
 * the McAfee Threat Intelligence Exchange (TIE) DXL service.
 *
 * The purpose of this client is to allow users to access the features of TIE
 * (manage reputations, determine where a file has executed, etc.) without
 * having to focus on lower-level details such as TIE-specific DXL topics and
 * message formats.
 * @param {external:DxlClient} dxlClient - The DXL client to use for
 *   communication with the TIE DXL service.
 * @constructor
 */
function TieClient (dxlClient) {
  Client.call(this, dxlClient)

  /**
   * Register an event callback with the DXL fabric.
   * @param {String} topic - Topic of the event to register
   * @param {Function} transform - Transform function to invoke with the content
   *   of the payload received for an event.
   * @param {Function} callback - Callback to invoke with the content returned
   *   from the `transform` function for the event payload as the first
   *   parameter and the original DXL event as the second parameter.
   * @private
   */
  this._addCallback = function (topic, transform, callback) {
    this._dxlClient.addEventCallback(topic, function (event) {
      var payload = MessageUtils.jsonPayloadToObject(event)
      transform(payload)
      callback(payload, event)
    })
  }

  /**
   * Common helper for retrieving reputations for files and certificates.
   * @param {Function} callback - Callback function to invoke with the results
   *   of the reputation lookup. If an error occurs when performing the
   *   lookup, the first parameter supplied to the callback contains an `Error`
   *   object with failure details. On successful lookup, a reputations object
   *   is provided as the second parameter to the callback.
   * @param {String} topic - DXL topic to query for reputations.
   * @param {Object} hashes - An object of hashes that identify the file or
   *   certificate to retrieve the reputations for. The `key` for each property
   *   is the `hash type` and the `value` is the `hex` representation of the
   *   hash value. See the [HashType]{@link module:HashType} module for the list
   *   of `hash type` constants.
   * @param {Object} payload - Initial content for the payload to send in the
   *   DXL reputation request. A transformed representation of the hashes is
   *   added to the payload before it is sent to the DXL fabric.
   * @private
   */
  this._getReputation = function (callback, topic, hashes, payload) {
    payload = payload || {}
    payload.scanType = 3 // Set Scan Type as 3 (On Demand Scan) to identify this request as not coming from an endpoint
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

  /**
   * Common helper for setting reputations for files and certificates.
   * @param {Function} callback - Callback to invoke after setting the
   *   reputation. If an error occurs when attempting to set the reputation, the
   *   first parameter supplied to the callback contains an `Error` object with
   *   failure details. If no error occurs, the first parameter supplied to the
   *   callback is `null`.
   * @param {String} topic - DXL topic to which the set reputation request is
   *   sent.
   * @param {Number} trustLevel - The new `trust level` for the file or
   *   certificate. The list of standard `trust levels` can be found in the
   *   [TrustLevel]{@link module:TrustLevel} constants module.
   * @param {Number} providerId - Id of the reputation provider.
   * @param {Object} hashes - An object of hashes that identify the file or
   *   certificate to update the reputation for. The `key` in each property is
   *   the `hash type` and the `value` is the `hex` representation of the hash
   *   value. See the [HashType]{@link module:HashType} module for the list of
   *   `hash type` constants.
   * @param {Object} payload - Initial content for the payload to send in the
   *   DXL reputation set request. Other parameters, including the `hashes`
   *   `trustLevel`, and `providerId` are added to the payload before it is
   *   sent to the DXL fabric.
   * @param {String} [comment] - A comment to associate with the file.
   * @private
   */
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
  /**
   * Common helper for setting reputations for files from an external provider.
   * @param {Function} callback - Callback to invoke after setting the reputation.
   * @param {String} topic - DXL topic to which the set reputation request is sent.
   * @param {Number} trustLevel - The new `trust level` for the file.
   *   The list of standard `trust levels` can be found in the
   *   [TrustLevel]{@link module:TrustLevel} constants module.
   * @param {Object} hashes - An object of hashes that identify the file
   *   to update the reputation for. The `key` in each property is
   *   the `hash type` and the `value` is the `hex` representation of the hash
   *   value. See the [HashType]{@link module:HashType} module for the list of
   *   `hash type` constants.
   * @param {Number} providerId - Id of the reputation provider.
   * @param {Number} fileType (optional) - A number that represents the file type.
   *   The list of standard `file types` can be found in the
   *   [FileType]{@link module:FileType} constants module.
   * @param {Object} payload - Initial content for the payload to send in the
   *   DXL reputation set request. Other parameters, including the `hashes`
   *   `trustLevel`, and `providerId` are added to the payload before it is
   *   sent to the DXL fabric.
   * @param {String} [comment] (optional)- A comment to associate with the file reputation.
   * @private
   */
  this._setExternalFileReputation = function (callback, topic, trustLevel, hashes, providerId, fileType, payload, comment) {
    if ((typeof trustLevel === 'undefined') || (trustLevel === null)) {
      throw new TypeError('Error: TrustLevel was not specified')
    }

    if (!Object.values(TrustLevel).includes(trustLevel)) {
      throw new TypeError('Error: TrustLevel was not a valid entry')
    }

    if (!Object.values(FileType).includes(fileType)) {
      throw new TypeError('Error: FileType was not a valid entry')
    }

    if ((typeof hashes === 'undefined') || (hashes === null) || (Object.keys(hashes).length === 0)) {
      throw new TypeError('Error: File hashes were not specified')
    }

    trustLevel = Number(trustLevel)
    if (isNaN(trustLevel)) {
      throw new TypeError('Error: TrustLevel was not a number')
    }

    var event = new dxl.Event(topic)
    payload = payload || {}
    comment = comment || ''
    payload.file.type = fileType
    payload.file.hashes = hashes
    payload.file.reputation = {
      score: trustLevel
    }
    payload.provider = {
      id: providerId
    }
    payload.comment = comment
    event.payload = payload

    this._dxlClient.sendEvent(event)
    callback()
  }

  /**
   * Common helper for retrieving the set of systems which have referenced the
   * specified file or certificate (as identified by hashes).
   * @param {Function} callback - Callback function to invoke with the results
   *   of the first references lookup. If an error occurs when performing the
   *   lookup, the first parameter supplied to the callback contains an `Error`
   *   object with failure details. On successful lookup, an array containing an
   *   object for each system that has referenced the file is provided as the
   *   second parameter to the callback.
   * @param {String} topic - DXL topic to which the first references request is
   *   sent.
   * @param {Object} hashes - An object of hashes that identify the file or
   *   certificate to lookup.  The `key` for each property is the `hash type`
   *   and the corresponding `value` is the `hex` representation of the hash
   *   value. See the [HashType]{@link module:HashType} module for the list of
   *   `hash type` constants.
   * @param {Object} payload - Initial content for the payload to send in the
   *   DXL first references request. A transformed representation of the hashes
   *   is added to the payload before it is sent to the DXL fabric.
   * @param {Number} [queryLimit=500] - The maximum number of results to return.
   * @private
   */
  this._getFirstReferences =
    function (callback, topic, hashes, payload, queryLimit) {
      payload = payload || {}
      if (typeof queryLimit === 'undefined') {
        queryLimit = DEFAULT_QUERY_LIMIT
      }
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

/**
 * Registers a callback with the client to receive `file detection` events.
 * Each `detection event` that is received from the DXL fabric will cause this
 * method to be invoked with the corresponding `detection information`.
 *
 * ** Detection Information **
 *
 * The `detection` information is provided as an object via the first parameter
 * delivered to the callback.
 *
 * An example `detection` object is shown below:
 *
 * ```js
 * {
 *   "agentGuid": "{68125cd6-a5d8-11e6-348e-000c29663178}",
 *   "detectionTime": 1481301038,
 *   "hashes": {
 *      "md5": "eb5e2b9dc51817a086d7b97eb52410ab",
 *      "sha1": "435dfd470f727437c7cb4f07cba1f9a1f4272656",
 *      "sha256": "414bb16b10ece2db2d8448cb9f313f80cb77c310ca0c19ee03c73cba0c16fedb"
 *   },
 *   "localReputation": 1,
 *   "name": "TEST_MALWARE.EXE",
 *   "remediationAction": 5
 * }
 * ```
 *
 * The top level property names in the object are listed in the
 * [DetectionEventProp]{@link module:DetectionEventProp} constants module.
 *
 * The information provided in the object includes:
 *
 * * System the detection occurred on.
 * * Time the detection occurred (Epoch time).
 * * File that triggered the detection (file name and associated hashes).
 * * Reputation value that was calculated locally which triggered the detection.
 * * Remediation action that occurred in response to the detection.
 * @example
 * tieClient.addFileDetectionCallback(function (detectionObj, originalEvent) {
 *   console.log('Detection on topic: ' + originalEvent.destinationTopic)
 *   console.log(MessageUtils.objectToJson(detectionObj, true))
 * })
 * @param {Function} detectionCallback - Callback that will receive
 *   `file detection` events. The first parameter passed to the callback
 *   function is an object decoded from the JSON payload of the event content.
 *   The second parameter passed to the callback function is the full DXL
 *   [Event]{@link external:Event} object.
 */
TieClient.prototype.addFileDetectionCallback =
  function (detectionCallback) {
    this._addCallback(TIE_EVENT_FILE_DETECTION_TOPIC,
      function (payload) {
        transformHashesFromServer(payload, DetectionEventProp.HASHES)
      },
      detectionCallback)
  }

/**
 * Unregisters a callback from the client so that it will no longer receive
 * `file detection` events.
 * @param {Function} detectionCallback - The callback instance to unregister.
 */
TieClient.prototype.removeFileDetectionCallback =
  function (detectionCallback) {
    this._dxlClient.addEventCallback(TIE_EVENT_FILE_DETECTION_TOPIC,
      detectionCallback)
  }

/**
 * Registers a callback with the client to receive `file first instance` events.
 * The "first instance" event indicates that this is the first time the file has
 * been encountered within the local enterprise. Each `first instance event`
 * that is received from the DXL fabric will cause this method to be invoked
 * with the corresponding `first instance information`.
 *
 * **First Instance Information**
 *
 * The `first instance` information is provided as an object via the first
 * parameter delivered to the callback.
 *
 * An example `first instance` object is shown below:
 *
 * ```js
 * {
 *   "agentGuid": "{68125cd6-a5d8-11e6-348e-000c29663178}",
 *   "hashes": {
 *     "md5": "31dbe8cc443d2ca7fd236ac00a52fb17",
 *     "sha1": "2d6ca45061b7972312e00e5933fdff95bb90b61b",
 *     "sha256": "aa3c461d4c21a392e372d0d6ca4ceb1e4d88098d587659454eaf4d93c661880f"
 *   },
 *   "name": "MORPH.EXE"
 * }
 * ```
 *
 * The top level property names in the object are listed in the
 * [FirstInstanceEventProp]{@link module:FirstInstanceEventProp} constants
 * module.
 *
 * The information provided in the object includes:
 *
 * * System the first instance of the file was found on
 * * File information (file name and associated hashes)
 * @example
 * tieClient.addFileFirstInstanceCallback(
 *   function (firstInstanceObj, originalEvent) {
 *     console.log('First instance on topic: ' + originalEvent.destinationTopic)
 *     console.log(MessageUtils.objectToJson(firstInstanceObj, true))
 *   }
 * )
 * @param {Function} firstInstanceCallback - Callback that will receive
 *   `file first instance` events. The first parameter passed to the callback
 *   function is an object decoded from the JSON payload of the event content.
 *   The second parameter passed to the callback function is the full DXL
 *   [Event]{@link external:Event} object.
 */
TieClient.prototype.addFileFirstInstanceCallback =
  function (firstInstanceCallback) {
    this._addCallback(TIE_EVENT_FILE_FIRST_INSTANCE_TOPIC,
      function (payload) {
        transformHashesFromServer(payload, FirstInstanceEventProp.HASHES)
      },
      firstInstanceCallback)
  }

/**
 * Unregisters a callback from the client so that it will no longer receive
 * `file first instance` events.
 * @param {Function} firstInstanceCallback - The callback instance to
 *   unregister.
 */
TieClient.prototype.removeFileFirstInstanceCallback =
  function (firstInstanceCallback) {
    this._dxlClient.removeEventCallback(TIE_EVENT_FILE_FIRST_INSTANCE_TOPIC,
      firstInstanceCallback)
  }

/**
 * Registers a callback with the client to receive `file reputation` change
 * events. Each `reputation change event` that is received from the DXL fabric
 * will cause this method to be invoked with the corresponding `reputation
 * change information`.
 *
 * **Reputation Change Information**
 *
 * The `Reputation Change` information is provided as an object via the first
 * parameter delivered to the callback.
 *
 * An example `reputation change` object is shown below:
 *
 * ```js
 * {
 *   "hashes": {
 *     "md5": "f2c7bb8acc97f92e987a2d4087d021b1",
 *     "sha1": "7eb0139d2175739b3ccb0d1110067820be6abd29",
 *     "sha256": "142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2"
 *   },
 *   "newReputations": {
 *     "1": {
 *       "attributes": {
 *         "2120340": "2139160704"
 *       },
 *       "createDate": 1480455704,
 *       "providerId": 1,
 *       "trustLevel": 99
 *     },
 *     "3": {
 *       "attributes": {
 *         "2101652": "235",
 *         "2102165": "1476902802",
 *         "2111893": "244",
 *         "2114965": "4",
 *         "2139285": "73183493944770750"
 *       },
 *       "createDate": 1476902802,
 *       "providerId": 3,
 *       "trustLevel": 99
 *     }
 *   },
 *   "oldReputations": {
 *     "1": {
 *       "attributes": {
 *         "2120340": "2139160704"
 *       },
 *       "createDate": 1480455704,
 *       "providerId": 1,
 *       "trustLevel": 99
 *     },
 *     "3": {
 *       "attributes": {
 *         "2101652": "235",
 *         "2102165": "1476902802",
 *         "2111893": "244",
 *         "2114965": "4",
 *         "2139285": "73183493944770750"
 *       },
 *       "createDate": 1476902802,
 *       "providerId": 3,
 *       "trustLevel": 85
 *     }
 *   },
 *   "updateTime": 1481219581
 * }
 * ```
 *
 * The top level property names in the object are listed in the
 * [FileRepChangeEventProp]{@link module:FileRepChangeEventProp} constants
 * module.
 *
 * The `reputation change` information is separated into 4 distinct sections:
 *
 * **Hash values**
 *
 * Keyed in the object by the `"hashes"` string.
 *
 * An object of hashes that identify the file whose reputation has changed. The
 * `key` in each property is the `hash type` and the ``value`` is the `hex`
 * representation of the hash value. See the [HashType]{@link module:HashType}
 * module for the list of `hash type` constants.
 *
 * **New reputations**
 *
 * Keyed in the object by the ``"newReputations"`` string.
 *
 * The new `Reputations` for the file whose reputation has changed, as an
 * object.
 *
 * The `key` for each property in the object corresponds to a particular
 * `provider` of the associated `reputation`. The list of `file reputation
 * providers` can be found in the [FileProvider]{@link module:FileProvider}
 * constants module.
 *
 * Each reputation contains a standard set of properties (trust level, creation
 * date, etc.). These properties are listed in the
 * [FileReputationProp]{@link module:FileReputationProp} constants module.
 *
 * Each reputation can also contain a provider-specific set of attributes as an
 * object. These attributes can be found in the following modules:
 *
 * | Module                                                    | Description |
 * | --------------------------------------------------------- | ----------- |
 * | [FileEnterpriseAttrib]{@link module:FileEnterpriseAttrib} | Attributes associated with the `Enterprise` reputation provider for files. |
 * | [FileGtiAttrib]{@link module:FileGtiAttrib}               | Attributes associated with the `Global Threat Intelligence (GTI)` reputation provider for files. |
 * | [AtdAttrib]{@link module:AtdAttrib}                       | Attributes associated with the `Advanced Threat Defense (ATD)` reputation provider. |
 *
 * **Old reputations**
 *
 * Keyed in the object by the ``"oldReputations"`` string.
 *
 * The previous `Reputations` for the file whose reputation has changed, as an
 * object.
 *
 * See the "New reputations" section above for additional information regarding
 * reputation details.
 *
 * **Change time**
 *
 * Keyed in the object by the ``"updateTime"`` string.
 *
 * The time the reputation change occurred (Epoch time).
 * @example
 * tieClient.addFileReputationChangeCallback(
 *   function (repChangeObj, originalEvent) {
 *     console.log('Reputation change on topic: ' +
 *       originalEvent.destinationTopic)
 *     console.log(MessageUtils.objectToJson(repChangeObj, true))
 *   }
 * )
 * @param {Function} repChangeCallback - Callback that will receive
 *   `file reputation` change events. The first parameter passed to the callback
 *   function is an object decoded from the JSON payload of the event content.
 *   The second parameter passed to the callback function is the full DXL
 *   [Event]{@link external:Event} object.
 */
TieClient.prototype.addFileReputationChangeCallback =
  function (repChangeCallback) {
    this._addCallback(TIE_EVENT_FILE_REPUTATION_CHANGE_TOPIC,
      transformChangedReputationPayload,
      repChangeCallback)
  }

/**
 * Unregisters a callback from the client so that it will no longer receive
 * `file reputation` change events.
 * @param {Function} repChangeCallback - The callback instance to unregister.
 */
TieClient.prototype.removeFileReputationChangeCallback =
  function (repChangeCallback) {
    this._dxlClient.addEventCallback(TIE_EVENT_FILE_REPUTATION_CHANGE_TOPIC,
      repChangeCallback)
  }

/**
 * Registers a callback with the client to receive `certificate reputation`
 * change events. Each `reputation change event` that is received from the DXL
 * fabric will cause this method to be invoked with the corresponding
 * `reputation change information`.
 *
 * **Reputation Change Information**
 *
 * The `Reputation Change` information is provided as an object via the first
 * parameter delivered to the callback.
 *
 * An example `reputation change` object is shown below:
 *
 * ```js
 * {
 *   "hashes": {
 *     "md5": "f2c7bb8acc97f92e987a2d4087d021b1",
 *     "sha1": "7eb0139d2175739b3ccb0d1110067820be6abd29",
 *     "sha256": "142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2"
 *   },
 *   "newReputations": {
 *     "1": {
 *       "attributes": {
 *         "2120340": "2139160704"
 *       },
 *       "createDate": 1480455704,
 *       "providerId": 1,
 *       "trustLevel": 99
 *     },
 *     "3": {
 *       "attributes": {
 *         "2101652": "235",
 *         "2102165": "1476902802",
 *         "2111893": "244",
 *         "2114965": "4",
 *         "2139285": "73183493944770750"
 *       },
 *       "createDate": 1476902802,
 *       "providerId": 3,
 *       "trustLevel": 99
 *     }
 *   },
 *   "oldReputations": {
 *     "1": {
 *       "attributes": {
 *         "2120340": "2139160704"
 *       },
 *       "createDate": 1480455704,
 *       "providerId": 1,
 *       "trustLevel": 99
 *     },
 *     "3": {
 *       "attributes": {
 *         "2101652": "235",
 *         "2102165": "1476902802",
 *         "2111893": "244",
 *         "2114965": "4",
 *         "2139285": "73183493944770750"
 *       },
 *       "createDate": 1476902802,
 *       "providerId": 3,
 *       "trustLevel": 85
 *     }
 *   },
 *   "updateTime": 1481219581
 * }
 * ```
 *
 * The top level property names in the object are listed in the
 * [CertRepChangeEventProp]{@link module:CertRepChangeEventProp} constants
 * module.
 *
 * The `reputation change` information is separated into 4 distinct sections:
 *
 * **Hash values**
 *
 * Keyed in the object by the `"hashes"` string.
 *
 * An object of hashes that identify the certificate whose reputation has
 * changed. The `key` in the object is the `hash type` and the ``value`` is
 * the `hex` representation of the hash value. See the [HashType]{@link
  * module:HashType} module for the list of `hash type` constants.
 *
 * There may also be a top-level property named ``"publicKeySha1"`` that
 * contains the SHA-1 of the certificate's public key.
 *
 * **New reputations**
 *
 * Keyed in the object by the ``"newReputations"`` string.
 *
 * The new `Reputations` for the file whose reputation has changed, as an
 * object.
 *
 * The `key` for each property in the object corresponds to a particular
 * `provider` of the associated `reputation`. The list of `certificate
 * reputation providers` can be found in the
 * [CertProvider]{@link module:CertProvider} constants module.
 *
 * Each reputation contains a standard set of properties (trust level, creation
 * date, etc.). These properties are listed in the
 * [CertReputationProp]{@link module:CertReputationProp} constants module.
 *
 * Each reputation can also contain a provider-specific set of attributes as an
 * object. These attributes can be found in the following modules:
 *
 * | Module                                                    | Description |
 * | --------------------------------------------------------- | ----------- |
 * | [CertEnterpriseAttrib]{@link module:CertEnterpriseAttrib} | Attributes associated with the `Enterprise` reputation provider for certificates. |
 * | [CertGtiAttrib]{@link module:CertGtiAttrib}               | Attributes associated with the `Global Threat Intelligence (GTI)` reputation provider for certificates. |
 *
 * **Old reputations**
 *
 * Keyed in the object by the ``"oldReputations"`` string.
 *
 * The previous `Reputations` for the file whose reputation has changed, as an
 * object.
 *
 * See the "New reputations" section above for additional information regarding
 * reputation details.
 *
 * **Change time**
 *
 * Keyed in the object by the ``"updateTime"`` string.
 *
 * The time the reputation change occurred (Epoch time).
 * @example
 * tieClient.addCertificateReputationChangeCallback(
 *   function (repChangeObj, originalEvent) {
 *     console.log('Reputation change on topic: ' +
 *       originalEvent.destinationTopic)
 *     console.log(MessageUtils.objectToJson(repChangeObj, true))
 *   }
 * )
 * @param {Function} repChangeCallback - Callback that will receive
 *   `certificate reputation` change events. The first parameter passed to the
 *   callback function is an object decoded from the JSON payload of the event
 *   content. The second parameter passed to the callback function is the full
 *   DXL [Event]{@link external:Event} object.
 */
TieClient.prototype.addCertificateReputationChangeCallback =
  function (repChangeCallback) {
    this._addCallback(TIE_EVENT_CERT_REPUTATION_CHANGE_TOPIC,
      transformChangedReputationPayload,
      repChangeCallback)
  }

/**
 * Unregisters a callback from the client so that it will no longer receive
 * `certificate reputation` change events.
 * @param {Function} repChangeCallback - The callback instance to unregister.
 */
TieClient.prototype.removeCertificateReputationChangeCallback =
  function (repChangeCallback) {
    this._dxlClient.removeEventCallback(TIE_EVENT_CERT_REPUTATION_CHANGE_TOPIC,
      repChangeCallback)
  }

/**
 * Retrieves the reputations for the specified file (as identified by hashes)
 *
 * At least one `hash value` of a particular `hash type` (MD5, SHA-1, etc.) must
 * be specified. Passing additional hashes increases the likelihood of other
 * reputations being located across the set of `file reputation providers`.
 *
 * **Reputations**
 *
 * The `Reputations` for the file is provided as an object via the second
 * parameter delivered to the callback.
 *
 * The `key` for each property in the object corresponds to a particular
 * `provider` of the associated `reputation`. The list of `file reputation
 * providers` can be found in the [FileProvider]{@link module:FileProvider}
 * constants module.
 *
 * An example reputations object is shown below:
 *
 * ```js
 * {
 *   "1": {
 *     "attributes": {
 *       "2120340": "2139160704"
 *     },
 *     "createDate": 1480455704,
 *     "providerId": 1,
 *     "trustLevel": 99
 *   },
 *   "3": {
 *     "attributes": {
 *       "2101652": "52",
 *       "2102165": "1476902802",
 *       "2111893": "56",
 *       "2114965": "1",
 *       "2139285": "73183493944770750"
 *     },
 *     "createDate": 1476902802,
 *     "providerId": 3,
 *     "trustLevel": 99
 *   }
 *}
 * ```
 *
 * The `"1"` `key` corresponds to a reputation from the
 * "Global Threat Intelligence (GTI)" reputation provider while the `"3"` `key`
 * corresponds to a reputation from the "Enterprise" reputation provider.
 *
 * Each reputation contains a standard set of properties (trust level, creation
 * date, etc.). These properties are listed in the
 * [FileReputationProp]{@link module:FileReputationProp} constants module.
 *
 * The following example shows how to access the `trust level` property of the
 * "Enterprise" reputation:
 *
 * ```js
 * var trustLevel = reputationsObj[FileProvider.ENTERPRISE][FileReputationProp.TRUST_LEVEL]
 * ```
 *
 * Each reputation can also contain a provider-specific set of attributes as an
 * object. These attributes can be found in the following modules:
 *
 * | Module                                                    | Description |
 * | --------------------------------------------------------- | ----------- |
 * | [FileEnterpriseAttrib]{@link module:FileEnterpriseAttrib} | Attributes associated with the `Enterprise` reputation provider for files. |
 * | [FileGtiAttrib]{@link module:FileGtiAttrib}               | Attributes associated with the `Global Threat Intelligence (GTI)` reputation provider for files. |
 * | [AtdAttrib]{@link module:AtdAttrib}                       | Attributes associated with the `Advanced Threat Defense (ATD)` reputation provider. |
 *
 * The following example shows how to access the `prevalence` attribute from the
 * "Enterprise" reputation:
 *
 * ```js
 * var entRep = reputationsObj[FileProvider.ENTERPRISE]
 * var entRepAttribs = entRep[FileReputationProp.ATTRIBUTES]
 * var prevalence = Number(entRepAttribs[FileEnterpriseAttrib.PREVALENCE])
 * ```
 * @example
 * var hashes = {}
 * hashes[HashType.MD5] = 'f2c7bb8acc97f92e987a2d4087d021b1'
 * hashes[HashType.SHA1] = '7eb0139d2175739b3ccb0d1110067820be6abd29'
 * hashes[HashType.SHA256] = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'
 * tieClient.getFileReputation(
 *   function (error, reputations) {
 *     if (error) {
 *       console.log('Error getting file reputations: ' + error.message)
 *     } else {
 *       console.log('File reputations:')
 *       console.log(MessageUtils.objectToJson(reputations, true))
 *     }
 *   },
 *   hashes
 * )
 * @param {Function} callback - Callback function to invoke with the results
 *   of the reputation lookup. If an error occurs when performing the
 *   lookup, the first parameter supplied to the callback contains an `Error`
 *   object with failure details. On successful lookup, a reputations object is
 *   provided as the second parameter to the callback. Each property `value`
 *   in the reputations object is a reputation from a particular
 *   `reputation provider`, which is identified by the key. The list of
 *   `file reputation providers` can be found in the
 *   [FileProvider]{@link module:FileProvider} constants module.
 * @param {Object} hashes - An object of hashes that identify the file to
 *   retrieve the reputations for. The `key` for each property is the
 *   `hash type` and the `value` is the `hex` representation of the hash value.
 *   See the [HashType]{@link module:HashType} module for the list of
 *   `hash type` constants.
 */
TieClient.prototype.getFileReputation =
  function (callback, hashes) {
    this._getReputation(callback, TIE_GET_FILE_REPUTATION_TOPIC, hashes)
  }

/**
 * Sets the "Enterprise" reputation  (`trust level`) of a specified file (as
 * identified by hashes).
 *
 * **Client Authorization**
 *
 * The OpenDXL Python client invoking this method must have permission to send
 * messages to the `/mcafee/service/tie/file/reputation/set` topic, which is
 * part of the `TIE Server Set Enterprise Reputation` authorization group.
 *
 * The following page provides an example of authorizing a Python client to
 * send messages to an `authorization group`. While the example is based on
 * McAfee Active Response (MAR), the instructions are the same with the
 * exception of swapping the `TIE Server Set Enterprise Reputation`
 * `authorization group` in place of `Active Response Server API`:
 *
 * <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>
 * @example
 * var hashes = {}
 * hashes[HashType.MD5] = 'f2c7bb8acc97f92e987a2d4087d021b1'
 * hashes[HashType.SHA1] = '7eb0139d2175739b3ccb0d1110067820be6abd29'
 * hashes[HashType.SHA256] = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'
 * tieClient.setFileReputation(
 *   function (error) {
 *     if (error) {
 *       console.log('Error: ' + error.message)
 *     } else {
 *       console.log('Succeeded')
 *     }
 *   },
 *   TrustLevel.KNOWN_TRUSTED,
 *   hashes,
 *   'notepad.exe',
 *   'Reputation set via OpenDXL'
 * )
 * @param {Function} callback - Callback to invoke after setting the file
 *   reputation. If an error occurs when attempting to set the reputation, the
 *   first parameter supplied to the callback contains an `Error` object with
 *   failure details. If no error occurs, the first parameter supplied to the
 *   callback is `null`.
 * @param {Number} trustLevel - The new `trust level` for the file. The list of
 *   standard `trust levels` can be found in the
 *   [TrustLevel]{@link module:TrustLevel} constants module.
 * @param {Object} hashes - An object of hashes that identify the file to
 *   update the reputation for. The `key` in each property is the `hash type`
 *   and the `value` is the `hex` representation of the hash value. See the
 *   [HashType]{@link module:HashType} module for the list of `hash type`
 *   constants.
 * @param {String} [filename] - A file name to associate with the file.
 * @param {String} [comment] - A comment to associate with the file.
 */
TieClient.prototype.setFileReputation =
  function (callback, trustLevel, hashes, filename, comment) {
    filename = filename || ''
    var payload = {filename: filename}
    this._setReputation(callback, TIE_SET_FILE_REPUTATION_TOPIC,
      trustLevel, FileProvider.ENTERPRISE, hashes, payload, comment)
  }

/**
 * Sets the External reputation  (`trust level`) of a specified file (as
 * identified by hashes).
 *
 * **Client Authorization**
 *
 * The OpenDXL Python client invoking this method must have permission to send
 * messages to the `/mcafee/event/external/file/report` topic, which is
 * part of the `TIE Server Set External Reputation` authorization group.
 *
 * The following page provides an example of authorizing a Python client to
 * send event to an `authorization group`. While the example is based on
 * McAfee Active Response (MAR), the instructions are the same with the
 * exception of swapping the `TIE Server Set External Reputation`
 * `authorization group` in place of `Active Response Server API`:
 *
 * <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>
 * @example
 * var hashes = {}
 * hashes[HashType.MD5] = FILE_MD5
 * hashes[HashType.SHA1] = FILE_SHA1
 * hashes[HashType.SHA256] = FILE_SHA256
 * tieClient.setExternalFileReputation(
 *   function() {
 *     client.destroy();
 *        console.log('Event sent')
 *  },
 *   TrustLevel.KNOWN_TRUSTED,
 *   hashes,
 *   'notepad.exe',
 *   'Reputation set via OpenDXL'
 * )
 * @param {Function} callback - Callback to invoke after sending the event to the
 * appliance.
 * @param {Number} trustLevel - The new `trust level` for the file. The list of
 *   standard `trust levels` can be found in the
 *   [TrustLevel]{@link module:TrustLevel} constants module.
 * @param {Object} hashes - An object of hashes that identify the file to
 *   update the reputation for. The `key` in each property is the `hash type`
 *   and the `value` is the `hex` representation of the hash value. See the
 *   [HashType]{@link module:HashType} module for the list of `hash type`
 *   constants.
 * @param {Number} [fileType] (optional) - A number that represents the file type.
 *   The list of standard `file types` can be found in the
 *   [FileType]{@link module:FileType} constants module.
 * @param {String} [filename] - A file name to associate with the file.
 * @param {String} [comment] (optional) - A comment to associate with the file.
 */
TieClient.prototype.setExternalFileReputation =
  function (callback, trustLevel, hashes, fileType, filename, comment) {
    filename = filename || ''
    comment = comment || ''
    fileType = fileType || 0
    var payload = {}
    payload.file = {
      attributes: {
        filename: filename
      }
    }
    this._setExternalFileReputation(callback, EVENT_TOPIC_EXTERNAL_FILE_REPORT,
      trustLevel, hashes, FileProvider.EXTERNAL, fileType, payload, comment)
  }

/**
 * Retrieves the set of systems which have referenced (typically executed) the
 * specified file (as identified by hashes).
 *
 * **Systems**
 *
 * The systems that have referenced the file is provided as an array of objects
 * via the second parameter delivered to the callback.
 *
 * An example array is shown below:
 *
 * ```js
 * [
 *   {
 *     "agentGuid": "{3a6f574a-3e6f-436d-acd4-bcde336b054d}",
 *     "date": 1475873692
 *   },
 *   {
 *     "agentGuid": "{68125cd6-a5d8-11e6-348e-000c29663178}",
 *     "date": 1478626172
 *   }
 * ]
 * ```
 *
 * Each entry in the array is an object containing details about a system that
 * has referenced the file. See the [FirstRefProp]{@link module:FirstRefProp}
 * constants module for details about the information that is available for each
 * system in the object.
 * @example
 * var fileHashes = {}
 * fileHashes[HashType.MD5] = 'f2c7bb8acc97f92e987a2d4087d021b1'
 * fileHashes[HashType.SHA1] = '7eb0139d2175739b3ccb0d1110067820be6abd29'
 * fileHashes[HashType.SHA256] = '142e1d688ef0568370c37187fd9f2351d7ddeda574f8bfa9b0fa4ef42db85aa2'
 *
 * tieClient.getFileFirstReferences(
 *   function (error, systems) {
 *     if (error) {
 *       console.log('Error getting file references: ' + error.message)
 *     } else {
 *       console.log('\nSystems that have referenced the file:\n')
 *       systems.forEach(function (system) {
 *         console.log('\t' + system[FirstRefProp.SYSTEM_GUID] + ': ' +
 *           EpochUtil.toLocalTimeString(system[FirstRefProp.DATE])
 *         )
 *       })
 *     }
 *   },
 *   fileHashes
 * )
 * @param {Function} callback - Callback function to invoke with the results
 *   of the first references lookup. If an error occurs when performing the
 *   lookup, the first parameter supplied to the callback contains an `Error`
 *   object with failure details. On successful lookup, an array containing an
 *   object for each system that has referenced the file is provided as the
 *   second parameter to the callback.
 * @param {Object} hashes - An object of hashes that identify the file to
 *   lookup.  The `key` for each property is the `hash type` and the
 *   corresponding `value` is the `hex` representation of the hash value. See
 *   the [HashType]{@link module:HashType} module for the list of `hash type`
 *   constants.
 * @param {Number} [queryLimit=500] - The maximum number of results to return.
 */
TieClient.prototype.getFileFirstReferences =
  function (callback, hashes, queryLimit) {
    this._getFirstReferences(callback, TIE_GET_FILE_FIRST_REFS_TOPIC, hashes,
      {}, queryLimit)
  }

/**
 * Retrieves the reputations for the specified certificate (as identified by the
 * SHA-1 of the certificate and optionally the SHA-1 of the certificate's public
 * key)
 *
 * While the SHA-1 of the certificate is required, passing the optional SHA-1 of
 * the certificate's public key can result in additional reputations being
 * located across the set of `certificate reputation providers`.
 *
 * **Reputations**
 *
 * The `Reputations` for the file is provided as an object via the second
 * parameter delivered to the callback.
 *
 * The `key` for each property in the object corresponds to a particular
 * `provider` of the associated `reputation`. The list of `file reputation
 * providers` can be found in the [FileProvider]{@link module:FileProvider}
 * constants module.
 *
 * An example reputations object is shown below:
 *
 * ```js
 * {
 *   "2": {
 *     "attributes": {
 *       "2108821": "92",
 *       "2109077": "1454912619",
 *       "2117524": "0",
 *       "2120596": "0"
 *     },
 *     "createDate": 1476318514,
 *     "providerId": 2,
 *     "trustLevel": 99
 *   },
 *   "4": {
 *     "attributes": {
 *       "2109333": "4",
 *       "2109589": "1476318514",
 *       "2139285": "73183493944770750"
 *     },
 *     "createDate": 1476318514,
 *     "providerId": 4,
 *     "trustLevel": 0
 *   }
 * }
 * ```
 *
 * The `"2"` `key` corresponds to a reputation from the
 * "Global Threat Intelligence (GTI)" reputation provider while the `"4"` `key`
 * corresponds to a reputation from the "Enterprise" reputation provider.
 *
 * Each reputation contains a standard set of properties (trust level, creation
 * date, etc.). These properties are listed in the
 * [CertReputationProp]{@link module:CertReputationProp} constants module.
 *
 * The following example shows how to access the `trust level` property of the
 * "Enterprise" reputation:
 *
 * ```js
 * var trustLevel = reputationsObj[CertProvider.ENTERPRISE][CertReputationProp.TRUST_LEVEL]
 * ```
 *
 * Each reputation can also contain a provider-specific set of attributes as an
 * object. These attributes can be found in the following modules:
 *
 * | Module                                                    | Description |
 * | --------------------------------------------------------- | ----------- |
 * | [CertEnterpriseAttrib]{@link module:CertEnterpriseAttrib} | Attributes associated with the `Enterprise` reputation provider for certificates. |
 * | [CertGtiAttrib]{@link module:CertGtiAttrib}               | Attributes associated with the `Global Threat Intelligence (GTI)` reputation provider for certificates. |
 *
 * The following example shows how to access the `prevalence` attribute from the
 * "Enterprise" reputation:
 *
 * ```js
 * var entRep = reputationsObj[CertProvider.ENTERPRISE]
 * var entRepAttribs = entRep[CertReputationProp.ATTRIBUTES]
 * var prevalence = Number(entRepAttribs[CertEnterpriseAttrib.PREVALENCE])
 * ```
 * @example
 * var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
 * var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'
 * tieClient.getCertReputation(
 *   function (error, reputations) {
 *     if (error) {
 *       console.log('Error getting certificate reputations: ' + error.message)
 *     } else {
 *       console.log('Certificate reputations:')
 *       console.log(MessageUtils.objectToJson(reputations, true))
 *     }
 *   },
 *   CERTIFICATE_BODY_SHA1,
 *   CERTIFICATE_PUBLIC_KEY_SHA1
 * )
 * @param {Function} callback - Callback function to invoke with the results
 *   of the reputation lookup. If an error occurs when performing the
 *   lookup, the first parameter supplied to the callback contains an `Error`
 *   object with failure details. On successful lookup, a reputations object is
 *   provided as the second parameter to the callback. Each property `value`
 *   in the reputations object is a reputation from a particular
 *   `reputation provider`, which is identified by the key. The list of
 *   `certificate reputation providers` can be found in the
 *   [CertProvider]{@link module:CertProvider} constants module.
 * @param {String} sha1 - The SHA-1 of the certificate.
 * @param {String} [publicKeySha1] - The SHA-1 of the certificate's public
 *   key.
 */
TieClient.prototype.getCertificateReputation =
  function (callback, sha1, publicKeySha1) {
    var payload = publicKeySha1 ? {publicKeySha1: hexToBase64(publicKeySha1)} : {}
    var hashes = {}
    hashes[HashType.SHA1] = sha1
    this._getReputation(callback, TIE_GET_CERT_REPUTATION_TOPIC, hashes, payload)
  }

/**
 * Sets the "Enterprise" reputation (`trust level`) of a specified certificate
 * (as identified by hashes).
 *
 * **Client Authorization**
 *
 * The OpenDXL Python client invoking this method must have permission to send
 * messages to the `/mcafee/service/tie/cert/reputation/set` topic, which is
 * part of the `TIE Server Set Enterprise Reputation` authorization group.
 *
 * The following page provides an example of authorizing a Python client to
 * send messages to an `authorization group`. While the example is based on
 * McAfee Active Response (MAR), the instructions are the same with the
 * exception of swapping the `TIE Server Set Enterprise Reputation`
 * `authorization group` in place of `Active Response Server API`:
 *
 * <https://opendxl.github.io/opendxl-client-python/pydoc/marsendauth.html>
 * @example
 * var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
 * var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'
 * tieClient.setCertificateReputation(
 *   function (error) {
 *     if (error) {
 *       console.log('Error: ' + error.message)
 *     } else {
 *       console.log('Succeeded')
 *     }
 *   },
 *   TrustLevel.KNOWN_TRUSTED,
 *   CERTIFICATE_BODY_SHA1,
 *   CERTIFICATE_PUBLIC_KEY_SHA1,
 *   'Reputation set via OpenDXL'
 * )
 * @param {Function} callback - Callback to invoke after setting the certificate
 *   reputation. If an error occurs when attempting to set the reputation, the
 *   first parameter supplied to the callback contains an `Error` object with
 *   failure details. If no error occurs, the first parameter supplied to the
 *   callback is `null`.
 * @param {Number} trustLevel - The new `trust level` for the certificate. The
 *   list of standard `trust levels` can be found in the
 *   [TrustLevel]{@link module:TrustLevel} constants module.
 * @param {String} sha1 - The SHA-1 of the certificate.
 * @param {String} [publicKeySha1] - The SHA-1 of the certificate's public
 *   key.
 * @param {String} [comment] - A comment to associate with the certificate.
 */
TieClient.prototype.setCertificateReputation =
  function (callback, trustLevel, sha1, publicKeySha1, comment) {
    var payload = publicKeySha1 ? {publicKeySha1: hexToBase64(publicKeySha1)} : {}
    var hashes = {}
    hashes[HashType.SHA1] = sha1
    this._setReputation(callback, TIE_SET_CERT_REPUTATION_TOPIC,
      trustLevel, CertProvider.ENTERPRISE, hashes, payload, comment)
  }

/**
 * Retrieves the set of systems which have referenced the specified certificate
 * (as identified by hashes).
 *
 * **Systems**
 *
 * The systems that have referenced the file is provided as an array of objects
 * via the second parameter delivered to the callback.
 *
 * An example array is shown below:
 *
 * ```js
 * [
 *   {
 *     "agentGuid": "{3a6f574a-3e6f-436d-acd4-bcde336b054d}",
 *     "date": 1475873692
 *   },
 *   {
 *     "agentGuid": "{68125cd6-a5d8-11e6-348e-000c29663178}",
 *     "date": 1478626172
 *   }
 * ]
 * ```
 *
 * Each entry in the array is an object containing details about a system that
 * has referenced the certificate. See the
 * [FirstRefProp]{@link module:FirstRefProp} constants module for details about
 * the information that is available for each system in the object.
 * @example
 * var CERTIFICATE_BODY_SHA1 = '6eae26db8c13182a7947982991b4321732cc3de2'
 * var CERTIFICATE_PUBLIC_KEY_SHA1 = '3b87a2d6f39770160364b79a152fcc73bae27adf'
 *
 * tieClient.getCertificateFirstReferences(
 *   function (error, systems) {
 *     if (error) {
 *       console.log('Error getting certificate references: ' + error.message)
 *     } else {
 *       console.log('\nSystems that have referenced the certificate:\n')
 *       systems.forEach(function (system) {
 *         console.log('\t' + system[FirstRefProp.SYSTEM_GUID] + ': ' +
 *           EpochUtil.toLocalTimeString(system[FirstRefProp.DATE])
 *         )
 *       })
 *     }
 *   },
 *   CERTIFICATE_BODY_SHA1,
 *   CERTIFICATE_PUBLIC_KEY_SHA1
 * )
 * @param {Function} callback - Callback function to invoke with the results
 *   of the first references lookup. If an error occurs when performing the
 *   lookup, the first parameter supplied to the callback contains an `Error`
 *   object with failure details. On successful lookup, an array containing an
 *   object for each system that has referenced the certificate is provided as
 *   the second parameter to the callback.
 * @param {String} sha1 - The SHA-1 of the certificate.
 * @param {String} [publicKeySha1] - The SHA-1 of the certificate's
 *   public key.
 * @param {Number} [queryLimit=500] - The maximum number of results to return.
 */
TieClient.prototype.getCertificateFirstReferences =
  function (callback, sha1, publicKeySha1, queryLimit) {
    var payload = publicKeySha1 ? {publicKeySha1: hexToBase64(publicKeySha1)} : {}
    var hashes = {}
    hashes[HashType.SHA1] = sha1
    this._getFirstReferences(callback, TIE_GET_CERT_FIRST_REFS_TOPIC, hashes,
      payload, queryLimit)
  }

module.exports = TieClient
