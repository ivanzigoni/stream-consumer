const axios = require("axios");
const fs = require("fs");
const path = require("path");
const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questionText = `📁 insert file's full path: `;

async function questionCallback(filePath: string) {
  if (!filePath || filePath === "") {
    return getQuestion();
  }

  await uploadFile(filePath);

  rl.close();
}

function getQuestion() {
  return rl.question(questionText, questionCallback);
}

async function uploadFile(filePath: string) {
  const fileStream = fs.createReadStream(filePath);

  const fileExt = filePath.split(".")[1];

  const mime = {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    jpg: "image/jpeg",
  }[fileExt];

  if (!mime) {
    console.log("🟥 unknown file ext");

    process.exit(1);
  }

  try {
    console.log("🔍 beginning to stream");

    await axios({
      method: "post",
      url: "http://localhost:3000/upload",
      data: fileStream,
      headers: {
        "Content-Type": mime,
        "x-file-name": `my-file-${Date.now()}`,
      },
    });

    console.log("🟩 stream finished");
  } catch (error) {
    console.log("🟥 error\n\n", error);
  }
}

getQuestion();
