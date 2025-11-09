/**
 * Example: Custom EDI 835 Generation
 * 
 * This example shows how to create your own EDI 835 with custom data
 */

const { generateEDI835 } = require('./generate-edi-835');
const fs = require('fs');

// Example 1: Simple single claim
const simpleExample = {
  payerInfo: {
    name: "Blue Cross Blue Shield",
    id: "BCBS001"
  },
  payeeInfo: {
    name: "City Medical Center",
    npi: "9876543210",
    taxId: "987654321"
  },
  checkInfo: {
    "checkNumber": "EFT567890",
    checkDate: "20231120",
    checkAmount: "450.00"
  },
  claims: [
    {
      patientControlNumber: "CLAIM001",
      claimStatusCode: "1",  // 1 = Processed as Primary
      chargeAmount: "500.00",
      paidAmount: "450.00",
      patientInfo: {
        lastName: "Anderson",
        firstName: "Mary",
        memberId: "MBR001234"
      },
      serviceLines: [
        {
          procedureCode: "99214",  // Office visit code
          chargeAmount: "500.00",
          paidAmount: "450.00",
          units: "1",
          dateOfService: "20231110"
        }
      ]
    }
  ]
};

// Example 2: Multiple claims with multiple service lines
const complexExample = {
  payerInfo: {
    name: "United Healthcare",
    id: "UHC123"
  },
  payeeInfo: {
    name: "Memorial Hospital",
    npi: "1111111111",
    taxId: "111222333"
  },
  checkInfo: {
    checkNumber: "CHK789456",
    checkDate: "20231120",
    checkAmount: "2250.00"
  },
  claims: [
    {
      patientControlNumber: "CLM12345",
      claimStatusCode: "1",
      chargeAmount: "1500.00",
      paidAmount: "1350.00",
      patientInfo: {
        lastName: "Williams",
        firstName: "Robert",
        memberId: "UHC987654"
      },
      serviceLines: [
        {
          procedureCode: "99215",  // High complexity visit
          chargeAmount: "750.00",
          paidAmount: "675.00",
          units: "1",
          dateOfService: "20231105"
        },
        {
          procedureCode: "85025",  // Complete blood count
          chargeAmount: "250.00",
          paidAmount: "225.00",
          units: "1",
          dateOfService: "20231105"
        },
        {
          procedureCode: "80053",  // Comprehensive metabolic panel
          chargeAmount: "500.00",
          paidAmount: "450.00",
          units: "1",
          dateOfService: "20231105"
        }
      ]
    },
    {
      patientControlNumber: "CLM12346",
      claimStatusCode: "1",
      chargeAmount: "1000.00",
      paidAmount: "900.00",
      patientInfo: {
        lastName: "Davis",
        firstName: "Jennifer",
        memberId: "UHC654321"
      },
      serviceLines: [
        {
          procedureCode: "99213",  // Established patient visit
          chargeAmount: "400.00",
          paidAmount: "360.00",
          units: "1",
          dateOfService: "20231106"
        },
        {
          procedureCode: "90471",  // Immunization administration
          chargeAmount: "250.00",
          paidAmount: "225.00",
          units: "1",
          dateOfService: "20231106"
        },
        {
          procedureCode: "90670",  // Pneumococcal vaccine
          chargeAmount: "350.00",
          paidAmount: "315.00",
          units: "1",
          dateOfService: "20231106"
        }
      ]
    }
  ]
};

// Generate and save examples
console.log('Example 1: Simple Single Claim');
console.log('================================');
const edi1 = generateEDI835(simpleExample);
console.log(edi1);
console.log();
fs.writeFileSync('./example-simple-835.edi', edi1);
console.log('Saved to: example-simple-835.edi\n');

console.log('Example 2: Complex Multiple Claims');
console.log('===================================');
const edi2 = generateEDI835(complexExample);
console.log(edi2);
console.log();
fs.writeFileSync('./example-complex-835.edi', edi2);
console.log('Saved to: example-complex-835.edi\n');

console.log('✓ All examples generated successfully!');
