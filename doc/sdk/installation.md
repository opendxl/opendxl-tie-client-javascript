### Prerequisites

* OpenDXL JavaScript Client (Node.js) library installed
  * <https://github.com/opendxl/opendxl-client-javascript>

* The OpenDXL JavaScript Client (Node.js) prerequisites must be satisfied
  * <https://opendxl.github.io/opendxl-client-javascript/jsdoc/tutorial-installation.html>

* McAfee Threat Intelligence Exchange Server installed and available on DXL fabric
  * <http://www.mcafee.com/us/products/threat-intelligence-exchange.aspx>

* Node.js 4.0 or higher installed.

### Installation

Before installing the TIE DXL JavaScript client library, change to the
directory which you extracted from the SDK zip file. For example:

```sh
cd {@releasezipname}
```

To install the library from a local tarball for a Mac or Linux-based operating
system, run the following command:

```sh
npm install lib/{@releasetarballname} --save
```

To install the library from a local tarball for Windows, run:

```sh
npm install lib\{@releasetarballname} --save
```

To install the library via the
[npm package registry](https://www.npmjs.com/package/@opendxl/dxl-tie-client),
run:

```sh
npm install @opendxl/dxl-tie-client --save
```
