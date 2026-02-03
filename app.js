//https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/UnderwritingAI?code=-hroyale2i8an-5ZsY6GvCw2Jx5RGJMljX1SYmqKd0SrAzFuTuBaPQ==
async function submitDocument(mode) {
  const output = document.getElementById("output");
  const fileInput = document.getElementById("fileInput");

  // Safety checks
  if (!fileInput) {
    output.innerText = "File input element not found.";
    return;
  }

  if (!fileInput.files || fileInput.files.length === 0) {
    output.innerText = "Please select a PDF file first.";
    return;
  }

  const file = fileInput.files[0];

  // Convert PDF → base64
  const base64 = await fileToBase64(file);

  output.innerText = "Processing document…";

  try {
    const response = await fetch(
      "https://famrsummaryscore-ceedd0e2d4buhscz.eastus2-01.azurewebsites.net/api/UnderwritingAI",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: mode,
          output: "text",
          documentBase64: base64
        })
      }
    );

    if (!response.ok) {
      output.innerText = "An error occurred while processing the document.";
      return;
    }

    const text = await response.text();

    output.innerText = text;

  } catch (err) {
    console.error(err);
    output.innerText = "A network error occurred.";
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Remove data:application/pdf;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
