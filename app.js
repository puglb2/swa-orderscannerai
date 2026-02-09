//https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/UnderwritingAI?code=-hroyale2i8an-5ZsY6GvCw2Jx5RGJMljX1SYmqKd0SrAzFuTuBaPQ==
// ---------------------------
// Configure endpoints
// ---------------------------

// Your underwriting endpoint (already working)
const UNDERWRITING_ENDPOINT =
  "https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/UnderwritingAI?code=-hroyale2i8an-5ZsY6GvCw2Jx5RGJMljX1SYmqKd0SrAzFuTuBaPQ==";

// Your order scanner endpoint (scan function)
// IMPORTANT: replace this with your actual scan endpoint URL
// Example: https://functionapporderscannerai-xxxx.azurewebsites.net/api/scan
const ORDER_SCAN_ENDPOINT =
  "https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/scan";


// ---------------------------
// Underwriting buttons
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

    const response = await fetch(UNDERWRITING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: mode,
        output: "text",
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
// Order Scan button
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
    const pdfBytes = await file.arrayBuffer();

    const response = await fetch(ORDER_SCAN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf"
      },
      body: pdfBytes
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


function formatOrderScanResults(data) {
  if (!data.orders || data.orders.length === 0) {
    return "No valid medical orders detected in this document.";
  }

  let result = "ORDER SCAN RESULTS\n";
  result += "------------------\n\n";

  data.orders.forEach(order => {

    result += `Order found on page ${order.page_number}\n\n`;

    if (order.order_type)
      result += `Type: ${capitalize(order.order_type)} Order\n`;

    if (order.ordering_provider)
      result += `Provider: ${order.ordering_provider}\n`;

    if (order.order_date)
      result += `Date: ${order.order_date}\n`;

    if (order.tests_or_procedures?.length) {
      result += "\nTests:\n";
      order.tests_or_procedures.forEach(t =>
        result += `• ${t}\n`
      );
    }

    if (order.icd10_codes?.length) {
      result += "\nICD-10 Codes:\n";
      order.icd10_codes.forEach(code =>
        result += `• ${code}\n`
      );
    }

    if (order.cpt_codes?.length) {
      result += "\nCPT Codes:\n";
      order.cpt_codes.forEach(code =>
        result += `• ${code}\n`
      );
    }

    result += `\nSignature: ${order.signature_present ? "Present" : "Not detected"}\n`;

    if (order.confidence)
      result += `Confidence: ${order.confidence}\n`;

    result += "\n------------------\n\n";
  });

  return result;
}


function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------
// Helpers
// ---------------------------

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
