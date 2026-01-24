// ============================================================
// PRODUCTION: Replace this with your Google Apps Script Web App URL
// 
// To set up quote submissions:
// 1. Create a new Google Sheet for submissions
// 2. Go to Extensions > Apps Script
// 3. Paste this code:
//
//    function doPost(e) {
//      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//      var data = JSON.parse(e.postData.contents);
//      sheet.appendRow([
//        new Date(),
//        data.quote,
//        data.author,
//        'pending'
//      ]);
//      return ContentService.createTextOutput(JSON.stringify({success: true}))
//        .setMimeType(ContentService.MimeType.JSON);
//    }
//
// 4. Deploy as Web App (Execute as: Me, Who has access: Anyone)
// 5. Copy the web app URL here
// ============================================================

const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

export interface QuoteSubmission {
  quote: string;
  author: string;
}

export async function submitQuote(submission: QuoteSubmission): Promise<boolean> {
  // For development/demo purposes, log the submission
  if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.log('Quote submission (no URL configured):', submission);
    // Return true for demo purposes
    return true;
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script requires this
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });
    
    // no-cors mode doesn't give us response data, so we assume success
    return true;
  } catch (error) {
    console.error('Failed to submit quote:', error);
    return false;
  }
}
