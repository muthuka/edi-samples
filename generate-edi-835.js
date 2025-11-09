const { X12Interchange } = require('node-x12');
const fs = require('fs');

/**
 * Generate EDI 835 (Health Care Claim Payment/Advice) from JSON
 * 
 * This script demonstrates how to create an EDI 835 transaction using the node-x12 library.
 * EDI 835 is used by health insurance payers to send payment and remittance advice to healthcare providers.
 */

/**
 * Converts JSON data to EDI 835 format
 * @param {Object} jsonData - The JSON data containing claim payment information
 * @returns {string} - The generated EDI 835 string
 */
function generateEDI835(jsonData) {
  const currentDate = new Date();
  const currentDateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '').slice(2); // YYMMDD
  const currentTimeStr = currentDate.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
  
  // Calculate total payment amount
  const totalPaid = jsonData.claims.reduce((sum, claim) => 
    sum + parseFloat(claim.paidAmount), 0
  ).toFixed(2);
  
  // Create interchange
  const interchange = new X12Interchange();
  
  // ISA segment - Interchange Control Header
  interchange.setHeader([
    '00',                             // Authorization Information Qualifier
    '          ',                     // Authorization Information (10 spaces)
    '00',                             // Security Information Qualifier
    '          ',                     // Security Information (10 spaces)
    'ZZ',                             // Interchange ID Qualifier (Sender)
    jsonData.payerInfo.id.padEnd(15), // Interchange Sender ID
    'ZZ',                             // Interchange ID Qualifier (Receiver)
    jsonData.payeeInfo.taxId.padEnd(15), // Interchange Receiver ID
    currentDateStr,                   // Interchange Date (YYMMDD)
    currentTimeStr.slice(0, 4),       // Interchange Time (HHMM)
    'U',                              // Interchange Control Standards ID
    '00401',                          // Interchange Control Version Number
    '000000001',                      // Interchange Control Number
    '0',                              // Acknowledgment Requested
    'P',                              // Usage Indicator (P = Production)
    ':'                               // Component Element Separator
  ]);
  
  // Create functional group
  const group = interchange.addFunctionalGroup();
  
  // GS segment - Functional Group Header
  group.setHeader([
    'HP',                             // Functional Identifier Code (HP = Health Care Claim Payment)
    jsonData.payerInfo.id,            // Application Sender's Code
    jsonData.payeeInfo.taxId,         // Application Receiver's Code
    currentDateStr,                   // Date (YYMMDD)
    currentTimeStr.slice(0, 4),       // Time (HHMM)
    '1',                              // Group Control Number
    'X',                              // Responsible Agency Code
    '005010X221A1'                    // Version/Release/Industry ID Code
  ]);
  
  // Create transaction set
  const transaction = group.addTransaction();
  
  // ST segment - Transaction Set Header
  transaction.setHeader([
    '835',                            // Transaction Set Identifier Code
    '0001'                            // Transaction Set Control Number
  ]);
  
  // BPR segment - Financial Information
  transaction.addSegment('BPR', [
    'I',                              // Transaction handling code (I = Information)
    totalPaid,                        // Total actual provider payment amount
    'C',                              // Credit/debit flag code (C = Credit)
    'ACH',                            // Payment method code
    '',                               // Payment format code
    '',                               // DFI ID number qualifier
    '',                               // DFI ID number
    '',                               // Account number qualifier
    '',                               // Account number
    jsonData.payerInfo.id,            // Payer identifier
    '',                               // Originating company supplemental code
    '',                               // DFI ID number qualifier
    '',                               // DFI ID number
    '',                               // Account number qualifier
    '',                               // Account number
    jsonData.checkInfo.checkDate      // Effective date (payment date)
  ]);
  
  // TRN segment - Reassociation Trace Number
  transaction.addSegment('TRN', [
    '1',                              // Trace type code
    jsonData.checkInfo.checkNumber,   // Check/EFT trace number
    jsonData.payerInfo.id             // Originating company identifier
  ]);
  
  // REF segment - Payer Identification
  transaction.addSegment('REF', [
    'EV',                             // Reference identification qualifier
    jsonData.payerInfo.id             // Payer identification number
  ]);
  
  // DTM segment - Production Date
  transaction.addSegment('DTM', [
    '405',                            // Date/time qualifier (405 = Production)
    currentDateStr                    // Date (YYMMDD)
  ]);
  
  // N1 segment - Payer Name
  transaction.addSegment('N1', [
    'PR',                             // Entity identifier code (PR = Payer)
    jsonData.payerInfo.name,          // Payer name
    'XV',                             // Identification code qualifier
    jsonData.payerInfo.id             // Payer identification
  ]);
  
  // N1 segment - Payee Name
  transaction.addSegment('N1', [
    'PE',                             // Entity identifier code (PE = Payee)
    jsonData.payeeInfo.name,          // Payee name
    'XX',                             // Identification code qualifier (XX = NPI)
    jsonData.payeeInfo.npi            // Payee NPI
  ]);
  
  // REF segment - Payee Additional Identification
  transaction.addSegment('REF', [
    'TJ',                             // Reference identification qualifier (TJ = Tax ID)
    jsonData.payeeInfo.taxId          // Tax identification number
  ]);
  
  // Process each claim
  jsonData.claims.forEach((claim, claimIndex) => {
    // CLP segment - Claim Payment Information
    transaction.addSegment('CLP', [
      claim.patientControlNumber,     // Patient control number
      claim.claimStatusCode,          // Claim status code (1 = processed as primary)
      claim.chargeAmount,             // Total claim charge amount
      claim.paidAmount,               // Claim payment amount
      '',                             // Patient responsibility amount
      '12',                           // Claim filing indicator code
      claim.patientControlNumber,     // Payer claim control number
      ''                              // Facility type code
    ]);
    
    // NM1 segment - Patient Name
    transaction.addSegment('NM1', [
      'QC',                           // Entity identifier code (QC = Patient)
      '1',                            // Entity type qualifier (1 = Person)
      claim.patientInfo.lastName,     // Last name
      claim.patientInfo.firstName,    // First name
      '',                             // Middle name
      '',                             // Name prefix
      '',                             // Name suffix
      'MI',                           // Identification code qualifier (MI = Member ID)
      claim.patientInfo.memberId      // Member identification number
    ]);
    
    // Process service lines for this claim
    claim.serviceLines.forEach((line, lineIndex) => {
      // SVC segment - Service Payment Information
      transaction.addSegment('SVC', [
        `HC:${line.procedureCode}`,   // Service identifier
        line.chargeAmount,            // Charge amount
        line.paidAmount,              // Paid amount
        '',                           // Revenue code (optional)
        line.units                    // Units
      ]);
      
      // DTM segment - Service Date
      transaction.addSegment('DTM', [
        '472',                        // Service date qualifier
        line.dateOfService            // Date
      ]);
    });
  });
  
  // PLB segment - Provider Level Adjustment (optional)
  transaction.addSegment('PLB', [
    jsonData.payeeInfo.npi,           // Provider identifier
    currentDateStr,                   // Fiscal period date
    '',                               // Adjustment reason code
    ''                                // Adjustment amount
  ]);
  
  // Return the generated EDI 835 string
  return interchange.toString();
}

// Main execution
if (require.main === module) {
  try {
    // Read sample JSON data
    const jsonData = JSON.parse(fs.readFileSync('./sample-835-data.json', 'utf8'));
    
    // Generate EDI 835
    const edi835 = generateEDI835(jsonData);
    
    // Output to console
    console.log('Generated EDI 835:');
    console.log('==================');
    console.log(edi835);
    
    // Save to file
    fs.writeFileSync('./output-835.edi', edi835);
    console.log('\nEDI 835 saved to output-835.edi');
    
  } catch (error) {
    console.error('Error generating EDI 835:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { generateEDI835 };
