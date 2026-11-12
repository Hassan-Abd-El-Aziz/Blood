/**
 * Google Apps Script for Blood Donors Google Sheets Integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Copy this entire code into the Code.gs file
 * 4. Create a Google Spreadsheet with a sheet named "Donors"
 * 5. Add headers in row 1: id, name, area, bloodType, image, phone
 * 6. Replace YOUR_SPREADSHEET_ID_HERE with your actual Spreadsheet ID
 * 7. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (or "Anyone with link" for more security)
 *    - Copy the Web App URL and put it in google-sheets-api.js
 * 8. Optional: Set an API_KEY in both this script and google-sheets-api.js for extra security
 */

// CONFIGURATION - REPLACE THESE VALUES
const CONFIG = {
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',  // Get from your Google Sheets URL
    SHEET_NAME: 'Donors',
    API_KEY: ''  // Optional: Set a secret key for API protection
};

// Column mappings (must match your sheet headers)
const COLUMNS = {
    id: 1,
    name: 2,
    area: 3,
    bloodType: 4,
    image: 5,
    phone: 6
};

/**
 * Main entry point for GET requests
 */
function doGet(e) {
    try {
        // DEBUG: Log incoming request
        console.log('=== doGet called ===');
        console.log('Parameters:', JSON.stringify(e.parameter));
        console.log('Action:', e.parameter.action);
        
        // Verify API key if set
        if (CONFIG.API_KEY && e.parameter.key !== CONFIG.API_KEY) {
            return createResponse(false, null, 'Invalid API key');
        }

        const action = e.parameter.action || 'getDonors';
        const sheetName = e.parameter.sheet || CONFIG.SHEET_NAME;

        console.log('Processing action:', action, 'on sheet:', sheetName);

        switch (action) {
            case 'getDonors':
                return handleGetDonors(sheetName);
            case 'addDonor':
                console.log('Calling handleAddDonor with:', JSON.stringify(e.parameter));
                return handleAddDonor(sheetName, e.parameter);
            case 'updateDonor':
                return handleUpdateDonor(sheetName, e.parameter.id, e.parameter);
            case 'deleteDonor':
                return handleDeleteDonor(sheetName, e.parameter.id);
            default:
                console.log('Unknown action:', action);
                return createResponse(false, null, `Unknown action: ${action}`);
        }
    } catch (error) {
        console.error('doGet error:', error);
        return createResponse(false, null, error.toString());
    }
}

/**
 * Main entry point for POST requests
 */
function doPost(e) {
    try {
        // Verify API key if set
        if (CONFIG.API_KEY) {
            const key = e.parameter.key || (e.postData ? getPostData(e).key : null);
            if (key !== CONFIG.API_KEY) {
                return createResponse(false, null, 'Invalid API key');
            }
        }

        const data = getPostData(e);
        const action = data.action || e.parameter.action;
        const sheetName = data.sheet || e.parameter.sheet || CONFIG.SHEET_NAME;

        switch (action) {
            case 'addDonor':
                return handleAddDonor(sheetName, data);
            case 'updateDonor':
                return handleUpdateDonor(sheetName, data.id, data);
            case 'deleteDonor':
                return handleDeleteDonor(sheetName, data.id || e.parameter.id);
            default:
                return createResponse(false, null, `Unknown action: ${action}`);
        }
    } catch (error) {
        return createResponse(false, null, error.toString());
    }
}

/**
 * Parse post data from either JSON or form data
 */
function getPostData(e) {
    if (e.postData && e.postData.contents) {
        try {
            return JSON.parse(e.postData.contents);
        } catch {
            // If not JSON, parse as form data
        }
    }
    // Form data is in e.parameter
    const data = {};
    for (const key in e.parameter) {
        data[key] = e.parameter[key];
    }
    return data;
}

/**
 * Get all donors from the sheet
 */
function handleGetDonors(sheetName) {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
        return createResponse(true, []);
    }

    const headers = data[0];
    const rows = data.slice(1);
    
    const donors = rows.map(row => {
        const donor = {};
        headers.forEach((header, index) => {
            donor[header] = row[index];
        });
        return donor;
    });

    return createResponse(true, donors);
}

/**
 * Add a new donor to the sheet
 */
function handleAddDonor(sheetName, data) {
    const sheet = getSheet(sheetName);
    
    // Log incoming data for debugging
    console.log('Adding donor:', JSON.stringify(data));
    
    // Get next ID
    const lastRow = sheet.getLastRow();
    let nextId = 1;
    if (lastRow > 1) {
        const lastId = sheet.getRange(lastRow, COLUMNS.id).getValue();
        nextId = (parseInt(lastId) || 0) + 1;
    }

    const newRow = [
        nextId,
        data.name || '',
        data.area || '',
        data.bloodType || '',
        data.image || 'https://img.icons8.com/?size=100&id=11178&format=png&color=000000',
        data.phone || ''
    ];

    console.log('New row data:', newRow);
    sheet.appendRow(newRow);
    console.log('Row appended successfully');

    return createResponse(true, { id: nextId, ...data });
}

/**
 * Update an existing donor
 */
function handleUpdateDonor(sheetName, id, data) {
    const sheet = getSheet(sheetName);
    const rowIndex = findRowById(sheet, id);
    
    if (!rowIndex) {
        return createResponse(false, null, `Donor with ID ${id} not found`);
    }

    const updates = {};
    if (data.name !== undefined) updates[COLUMNS.name] = data.name;
    if (data.area !== undefined) updates[COLUMNS.area] = data.area;
    if (data.bloodType !== undefined) updates[COLUMNS.bloodType] = data.bloodType;
    if (data.image !== undefined) updates[COLUMNS.image] = data.image;
    if (data.phone !== undefined) updates[COLUMNS.phone] = data.phone;

    Object.entries(updates).forEach(([col, value]) => {
        sheet.getRange(rowIndex, col).setValue(value);
    });

    return createResponse(true, { id, ...data });
}

/**
 * Delete a donor
 */
function handleDeleteDonor(sheetName, id) {
    const sheet = getSheet(sheetName);
    const rowIndex = findRowById(sheet, id);
    
    if (!rowIndex) {
        return createResponse(false, null, `Donor with ID ${id} not found`);
    }

    sheet.deleteRow(rowIndex);
    return createResponse(true, { id, deleted: true });
}

/**
 * Helper: Get sheet by name, create if doesn't exist
 */
function getSheet(sheetName) {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        // Add headers
        const headers = ['id', 'name', 'area', 'bloodType', 'image', 'phone'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    return sheet;
}

/**
 * Helper: Find row index by ID
 */
function findRowById(sheet, id) {
    const data = sheet.getRange(2, COLUMNS.id, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < data.length; i++) {
        if (data[i][0] == id) {
            return i + 2; // +2 because data starts at row 2 (row 1 is headers)
        }
    }
    return null;
}

/**
 * Helper: Create standardized JSON response
 */
function createResponse(success, data, error = null) {
    const response = { success };
    if (data !== null && data !== undefined) response.data = data;
    if (error) response.error = error;
    
    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - run this to verify setup
 */
function testSetup() {
    try {
        const sheet = getSheet(CONFIG.SHEET_NAME);
        console.log('Sheet name:', sheet.getName());
        console.log('Last row:', sheet.getLastRow());
        
        const result = handleGetDonors(CONFIG.SHEET_NAME);
        console.log('Get donors result:', result.getContent());
        
        return 'Setup test successful! Check logs.';
    } catch (error) {
        console.error('Setup test failed:', error);
        return 'Setup test failed: ' + error.toString();
    }
}

function importExistingData() {
    const sheet = getSheet(CONFIG.SHEET_NAME);
    const donors = [
        // انسخ محتوى donorsDatabase من donors-data.js هنا
    ];
    
    donors.forEach((donor, index) => {
        sheet.appendRow([
            index + 1,
            donor.name,
            donor.area,
            donor.bloodType,
            donor.image,
            donor.phone
        ]);
    });
}