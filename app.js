const FUNCTION_URL = "https://functionapporderscannerai-ccecbncgayhpfwe0.eastus2-01.azurewebsites.net/api/UnderwritingAI?code=QdM0x_uMLyfN9SAme91OrwCLH2oHwdbSgSrTf854ITjeAzFuvcG4LQ==";

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

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 2);

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
