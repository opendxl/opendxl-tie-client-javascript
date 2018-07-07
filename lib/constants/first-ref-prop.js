/**
 * @module FirstRefProp
 * @description The properties that are available in an object  for each system
 * that has referenced a file or certificate.
 *
 * For more information see the "first reference" methods:
 *
 * * For files: {@link TieClient#getFileFirstReferences}
 * * For certificates: {@link TieClient#getCertificateFirstReferences}
 *
 * | Name        | Description |
 * | ----------- | ----------- |
 * | DATE        | The time the system first referenced the file or certificate (Epoch time). |
 * | SYSTEM_GUID | The GUID of the system that referenced the file or certificate. |
 */

'use strict'

module.exports = {
  /**
   * The time the system first referenced the file or certificate (Epoch time).
   *
   * See the [EpochUtil]{@link module:EpochUtil} module for helper methods used
   * to parse the Epoch time.
   */
  DATE: 'date',
  /**
   * The GUID of the system that referenced the file or certificate.
   */
  SYSTEM_GUID: 'agentGuid'
}
