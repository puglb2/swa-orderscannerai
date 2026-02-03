const FUNCTION_URL = "https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/UnderwritingAI?code=-hroyale2i8an-5ZsY6GvCw2Jx5RGJMljX1SYmqKd0SrAzFuTuBaPQ==";

async function submitDocument(mode) {
  const fileInput = document.getElementById("pdfInput");
  const output = document.getElementById("output");

  if (!fileInput.files.length) {
    alert("Please upload a PDF first.");
    return;
  }

  output.textContent = "Processing...";

  const file = fileInput.files[0];
  const base64 = await fileToBase64(file);

  const payload = {
    mode: mode,
    documentBase64: base64
  };

  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

const text = await response.text();

try {
  const data = JSON.parse(text);
  output.textContent = JSON.stringify(data, null, 2);
} catch {
  output.textContent = text;
}

  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
}

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

