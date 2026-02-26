// ---------------------------
// Configure endpoints
// ---------------------------

const UNDERWRITING_ENDPOINT =
  "https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/UnderwritingAI?code=OT5GTE_GiyNHtYaloDaLXDmcFhaLN1z1fKkth-ImF55pAzFu7Imq2Q==";

const ORDER_SCAN_ENDPOINT =
  "https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/scan";


// ---------------------------
// Underwriting Buttons (FIXED)
// ---------------------------

async function submitUnderwriting(mode) {
  const output = document.getElementById("output");
  const fileInput = document.getElementById("fileInput");

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    output.innerText = "Please select a PDF file first.";
    return;
  }

  const file = fileInput.files[0];
  output.innerText = "Processing underwriting request…";

  try {
    const base64 = await fileToBase64(file);

    console.log("MODE:", mode); // debug

    const response = await fetch(UNDERWRITING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: mode,
        documentBase64: base64
      })
    });

    const text = await response.text();

    if (!response.ok) {
      output.innerText = "Error processing underwriting request.\n\n" + text;
      return;
    }

    output.innerText = text;

  } catch (err) {
    console.error(err);
    output.innerText = "A network or client error occurred.";
  }
}


// ---------------------------
// Order Scan Button (UNCHANGED)
// ---------------------------

async function submitOrderScan() {
  const output = document.getElementById("output");
  const fileInput = document.getElementById("fileInput");

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    output.innerText = "Please select a PDF file first.";
    return;
  }

  const file = fileInput.files[0];
  output.innerText = "Scanning order…";

  try {
    const response = await fetch(ORDER_SCAN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf"
      },
      body: file
    });

    const text = await response.text();

    if (!response.ok) {
      output.innerText = "Error scanning order.\n\n" + text;
      return;
    }

    const data = JSON.parse(text);
    output.innerText = formatOrderScanResults(data);

  } catch (err) {
    console.error(err);
    output.innerText = "Scan failed.";
  }
}


// ---------------------------
// Formatting
// ---------------------------

function formatOrderScanResults(data) {
  let result = "ORDER SCAN RESULTS\n";
  result += "------------------\n\n";

  if (!data.orders || data.orders.length === 0) {
    result += "No valid medical orders detected in this document.\n";
  } else {
    data.orders.forEach(order => {

      result += `Order found on page ${order.page_number}\n\n`;

      result += `Type: ${order.order_type ? capitalize(order.order_type) : "Not identified"}\n`;
      result += `Provider: ${order.ordering_provider || "Not identified"}\n`;
      result += `Date: ${order.order_date || "Not identified"}\n`;

      result += "\nTests:\n";
      if (order.tests_or_procedures?.length) {
        order.tests_or_procedures.forEach(t => result += `• ${t}\n`);
      } else {
        result += "• Not identified\n";
      }

      result += "\nICD-10 Codes:\n";
      if (order.icd10_codes?.length) {
        order.icd10_codes.forEach(code => result += `• ${code}\n`);
      } else {
        result += "• Not identified\n";
      }

      result += "\nCPT Codes:\n";
      if (order.cpt_codes?.length) {
        order.cpt_codes.forEach(code => result += `• ${code}\n`);
      } else {
        result += "• Not identified\n";
      }

      result += `\nSignature: ${order.signature_present ? "Present" : "Not detected"}\n`;
      result += `Confidence: ${order.confidence || "N/A"}\n`;

      result += "\n------------------\n\n";
    });
  }

  if (data.document_signature) {
    result += "DOCUMENT-LEVEL SIGNATURE\n";
    result += "------------------------\n";
    result += `Signature: ${data.document_signature.signature_present ? "Present" : "Not detected"}\n`;
  }

  return result;
}


function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}


// ---------------------------
// Helper (REQUIRED)
// ---------------------------

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
