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

    // Show full raw response no matter what
    output.innerText =
      "Status: " + response.status + "\n\n" +
      text;

  } catch (err) {
    console.error(err);
    output.innerText = "Client error:\n\n" + err.toString();
  }
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
