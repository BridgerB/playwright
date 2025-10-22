async function testScreenshot() {
  console.log("Testing screenshot function...");

  const response = await fetch(
    "https://us-central1-playwright-bridgerb-com.cloudfunctions.net/screenshot",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: "https://bridgerb.com" }),
    },
  );

  const data = await response.json();

  if (data.error) {
    console.error("Error:", data.error);
    Deno.exit(1);
  }

  if (!data.screenshot) {
    console.error("No screenshot data received");
    Deno.exit(1);
  }

  console.log("Screenshot received successfully!");

  // Create HTML file with the screenshot
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screenshot Test</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    img {
      max-width: 100%;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <img src="${data.screenshot}" alt="Screenshot of bridgerb.com">
</body>
</html>`;

  const outputPath = "/tmp/screenshot-test.html";
  await Deno.writeTextFile(outputPath, html);

  console.log(`Opening screenshot in Chromium...`);
  const command = new Deno.Command("chromium", {
    args: [outputPath],
  });
  await command.output();
}

testScreenshot().catch(console.error);
