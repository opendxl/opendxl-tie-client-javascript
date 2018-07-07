/**
 * @module CertProvider
 * @description Constants that are used to indicate the `provider` of a
 * particular `certificate reputation`.
 *
 * | Name       | Numeric | Description |
 * | ---------- | ------- | ----------- |
 * | GTI        | 2       | Global Threat Intelligence (GTI). |
 * | ENTERPRISE | 4       | Enterprise reputation (specific to the local enterprise). |
 */

'use strict'

module.exports = {
  /**
   * Global Threat Intelligence (GTI).
   */
  GTI: 2,
  /**
   * Enterprise reputation (specific to the local enterprise).
   */
  ENTERPRISE: 4
}
