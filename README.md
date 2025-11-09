# idi-samples

Playground to convert structured data into EDI 835 file using the [node-x12](https://github.com/aaronhuggins/node-x12) library.

## Overview

This repository contains a sample Node.js script that demonstrates how to generate EDI 835 (Health Care Claim Payment/Advice) transactions from JSON data. EDI 835 is a standard format used by health insurance payers to send payment and remittance advice to healthcare providers.

## Prerequisites

- Node.js (version 12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/muthuka/idi-samples.git
cd idi-samples
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Sample Script

The repository includes a sample script that generates an EDI 835 file from JSON data:

```bash
node generate-edi-835.js
# or
npm start
```

This will:
- Read the sample data from `sample-835-data.json`
- Generate an EDI 835 transaction
- Output the EDI string to the console
- Save the EDI file to `output-835.edi`

### Running the Examples

For more comprehensive examples showing different scenarios:

```bash
node examples.js
# or
npm run examples
```

This will generate two example EDI 835 files:
- `example-simple-835.edi` - A simple single claim with one service line
- `example-complex-835.edi` - Multiple claims with multiple service lines each

### Using as a Module

You can also use the `generateEDI835` function in your own code:

```javascript
const { generateEDI835 } = require('./generate-edi-835');
const fs = require('fs');

// Load your JSON data
const jsonData = JSON.parse(fs.readFileSync('./your-data.json', 'utf8'));

// Generate EDI 835
const edi835 = generateEDI835(jsonData);

// Save or process the EDI string
fs.writeFileSync('./output.edi', edi835);
```

## JSON Data Format

The input JSON should follow this structure:

```json
{
  "payerInfo": {
    "name": "Insurance Company Name",
    "id": "12345"
  },
  "payeeInfo": {
    "name": "Healthcare Provider Name",
    "npi": "1234567893",
    "taxId": "123456789"
  },
  "checkInfo": {
    "checkNumber": "CHK123456",
    "checkDate": "20231115",
    "checkAmount": "1500.00"
  },
  "claims": [
    {
      "patientControlNumber": "PAT001",
      "claimStatusCode": "1",
      "chargeAmount": "1000.00",
      "paidAmount": "800.00",
      "patientInfo": {
        "lastName": "Smith",
        "firstName": "John",
        "memberId": "MEM123456"
      },
      "serviceLines": [
        {
          "procedureCode": "99213",
          "chargeAmount": "500.00",
          "paidAmount": "400.00",
          "units": "1",
          "dateOfService": "20231101"
        }
      ]
    }
  ]
}
```

## EDI 835 Segments

The generated EDI 835 includes the following key segments:

- **ISA/IEA** - Interchange Control Header/Trailer
- **GS/GE** - Functional Group Header/Trailer
- **ST/SE** - Transaction Set Header/Trailer
- **BPR** - Financial Information (total payment)
- **TRN** - Reassociation Trace Number (check/EFT number)
- **REF** - Reference Information (payer ID, tax ID)
- **DTM** - Date/Time Reference (production date)
- **N1** - Party Identification (payer, payee)
- **CLP** - Claim Payment Information
- **NM1** - Individual/Organization Name (patient)
- **SVC** - Service Payment Information
- **PLB** - Provider Level Adjustment

## About node-x12

This project uses the [node-x12](https://github.com/aaronhuggins/node-x12) library, which provides:

- ASC X12 parser for reading EDI files
- Generator for creating EDI files from structured data
- Query engine for extracting data from parsed EDI
- Support for streaming large EDI files
- Transaction set to object mapping

## Files

- `generate-edi-835.js` - Main script for generating EDI 835 from JSON
- `sample-835-data.json` - Sample JSON data with claim payment information
- `examples.js` - Additional examples showing simple and complex scenarios
- `package.json` - Node.js project configuration and dependencies

## Resources

- [node-x12 Documentation](https://github.com/aaronhuggins/node-x12)
- [EDI 835 Specification](https://x12.org/)
- [ASC X12 Standards](https://x12.org/products/x12-standards)

## License

ISC
