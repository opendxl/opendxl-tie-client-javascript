/**
 * @module AtdTrustLevel
 * @description Constants that are used to indicate the `trust level` of a file
 * or certificate as returned by the Advanced Threat Defense (ATD) `reputation
 * provider`.
 *
 * | Name                  | Numeric | Description |
 * | --------------------- | ------- | ----------- |
 * | KNOWN_TRUSTED         | -1      | It is a trusted file or certificate. |
 * | MOST_LIKELY_TRUSTED   | 0       | It is almost certain that the file or certificate is trusted. |
 * | MIGHT_BE_TRUSTED      | 1       | It seems to be a benign file or certificate. |
 * | UNKNOWN               | 2       | The reputation provider has encountered the file or certificate before but the provider can't determine its reputation at the moment. |
 * | MIGHT_BE_MALICIOUS    | 3       | It seems to be a suspicious file or certificate. |
 * | MOST_LIKELY_MALICIOUS | 4       | It is almost certain that the file or certificate is malicious. |
 * | KNOWN_MALICIOUS       | 5       | It is a malicious file or certificate. |
 * | NOT_SET               | -2      | The file or certificate's reputation hasn't been determined yet. |
 */

'use strict'

module.exports = {
  /**
   * It is a trusted file or certificate.
   */
  KNOWN_TRUSTED: -1,
  /**
   * It is almost certain that the file or certificate is trusted.
   */
  MOST_LIKELY_TRUSTED: 0,
  /**
   * It seems to be a benign file or certificate.
   */
  MIGHT_BE_TRUSTED: 1,
  /**
   * The reputation provider has encountered the file or certificate before but
   * the provider can't determine its reputation at the moment.
   */
  UNKNOWN: 2,
  /**
   * It seems to be a suspicious file or certificate.
   */
  MIGHT_BE_MALICIOUS: 3,
  /**
   * It is almost certain that the file or certificate is malicious.
   */
  MOST_LIKELY_MALICIOUS: 4,
  /**
   * It is a malicious file or certificate.
   */
  KNOWN_MALICIOUS: 5,
  /**
   * The file or certificate's reputation hasn't been determined yet.
   */
  NOT_SET: -2
}
