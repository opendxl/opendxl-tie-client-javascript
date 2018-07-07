/**
 * @module HashType
 * @description Constants that are used to indicate `hash type`.
 *
 * | Name   | Description |
 * | -------| ----------- |
 * | MD5    | The MD5 algorithm (128-bit). |
 * | SHA1   | The Secure Hash Algorithm 1 (SHA-1) (160-bit). |
 * | SHA256 | The Secure Hash Algorithm 2, 256 bit digest (SHA-256). |
 */

'use strict'

module.exports = {
  /**
   * The MD5 algorithm (128-bit).
   */
  MD5: 'md5',
  /**
   * The Secure Hash Algorithm 1 (SHA-1) (160-bit).
   */
  SHA1: 'sha1',
  /**
   * The Secure Hash Algorithm 2, 256 bit digest (SHA-256).
   */
  SHA256: 'sha256'
}
