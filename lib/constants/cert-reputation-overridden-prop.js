/**
 * @module CertReputationOverriddenProp
 * @description The set of properties associated with the
 * [OVERRIDDEN]{@link module:CertReputationProp.OVERRIDDEN} property of a
 * `certificate reputation`.
 *
 * | Name      | Description |
 * | ----------| ----------- |
 * | FILES     | The array of files that currently override the certificate, identified by their `hashes`. |
 * | TRUNCATED | Whether the array of files has been truncated (indicated by a `1`). |
 */

'use strict'

module.exports = {
  /**
   * The array of files that currently override the certificate, identified by
   * their `hashes`.
   */
  FILES: 'files',
  /**
   * Whether the array of files has been truncated (indicated by a `1`).
   */
  TRUNCATED: 'truncated'
}
