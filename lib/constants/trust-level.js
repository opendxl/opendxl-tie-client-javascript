/**
 * @module TrustLevel
 * @description Constants that are used to indicate the `trust level` of a file
 * or certificate.
 *
 * | Name                    | Numeric | Description |
 * | ----------------------- | ------- | ----------- |
 * | KNOWN_TRUSTED_INSTALLER | 100     | It is a trusted installer. |
 * | KNOWN_TRUSTED           | 99      | It is a trusted file or certificate. |
 * | MOST_LIKELY_TRUSTED     | 85      | It is almost certain that the file or certificate is trusted. |
 * | MIGHT_BE_TRUSTED        | 70      | It seems to be a benign file or certificate. |
 * | UNKNOWN                 | 50      | The reputation provider has encountered the file or certificate before but the provider can't determine its reputation at the moment. |
 * | MIGHT_BE_MALICIOUS      | 30      | It seems to be a suspicious file or certificate. |
 * | MOST_LIKELY_MALICIOUS   | 15      | It is almost certain that the file or certificate is malicious. |
 * | KNOWN_MALICIOUS         | 1       | It is a malicious file or certificate. |
 * | NOT_SET                 | 0       | The file or certificate's reputation hasn't been determined yet. |
 */

'use strict'

module.exports = {
    /**
     * It is a trusted installer.
     */
  KNOWN_TRUSTED_INSTALLER: 100,
    /**
     * It is a trusted file or certificate.
     */
  KNOWN_TRUSTED: 99,
    /**
     * It is almost certain that the file or certificate is trusted.
     */
  MOST_LIKELY_TRUSTED: 85,
    /**
     * It seems to be a benign file or certificate.
     */
  MIGHT_BE_TRUSTED: 70,
    /**
     * The reputation provider has encountered the file or certificate before but
     * the provider can't determine its reputation at the moment.
     */
  UNKNOWN: 50,
    /**
     * It seems to be a suspicious file or certificate.
     */
  MIGHT_BE_MALICIOUS: 30,
    /**
     * It is almost certain that the file or certificate is malicious.
     */
  MOST_LIKELY_MALICIOUS: 15,
    /**
     * It is a malicious file or certificate.
     */
  KNOWN_MALICIOUS: 1,
    /**
     * The file or certificate's reputation hasn't been determined yet.
     */
  NOT_SET: 0
}
