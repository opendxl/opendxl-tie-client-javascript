## Overview

The [McAfee Threat Intelligence Exchange](http://www.mcafee.com/us/products/threat-intelligence-exchange.aspx)
(TIE) DXL JavaScript client library provides a high level wrapper for the TIE
[Data Exchange Layer](http://www.mcafee.com/us/solutions/data-exchange-layer.aspx)
(DXL) API.

The purpose of this library is to allow users to access the features of TIE
(manage reputations, determine where a file has executed, etc.) without having
to focus on lower-level details such as TIE-specific DXL topics and message
formats.

The {@link TieClient} class wraps the connection to the DXL fabric and is used
to access the features of TIE.

## Installation

* {@tutorial installation}

## Samples

* [Samples Overview]{@tutorial samples}
  * Basic
    * Service Invocations
      * {@tutorial basic-get-file-reputation-example}
      * {@tutorial basic-get-cert-reputation-example}
      * {@tutorial basic-set-file-reputation-example}
      * {@tutorial basic-set-cert-reputation-example}
      * {@tutorial basic-get-file-first-ref-example}
      * {@tutorial basic-get-cert-first-ref-example}
    * Events
      * {@tutorial basic-reputation-change-callback-example}
      * {@tutorial basic-detection-callback-example}
      * {@tutorial basic-first-instance-callback-example}
  * Advanced
    * Service Invocations
      * {@tutorial advanced-get-reputation-example}

## JavaScript API

* {@link TieClient}
