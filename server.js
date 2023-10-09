import express from "express";
import EventEmitter from "events";
import * as fs from "fs";

// import { appendFile } from "node:fs";

const chatEmitter = new EventEmitter();
const port = process.env.PORT || 1337;

const app = express();
app.get("/chat", respondChat);
app.get("/sse", respondSSE);
app.get("/static/*", respondStatic);

app.use(express.static("public"));

function respondChat(req, res) {
  const { message } = req.query;

  chatEmitter.emit("message", message);

  fs.appendFile("message.txt", ` ${message}\n\n`, (err) => {
    if (err) throw err;
    console.log('The "data to append" was appended to file!');
  });
}

function respondStatic(req, res) {
  const filename = `${__dirname}/public/${req.params[0]}`;
  fs.createReadStream(filename)
    .on("error", () => respondNotFound(req, res))
    .pipe(res);
}

function respondNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}
//SSE function
function respondSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  const onMessage = (msg) => res.write(`data: ${msg}\n\n`);
  chatEmitter.on("message", onMessage);
  res.on("close", function () {
    chatEmitter.off("message", onMessage);
  });
}

app.listen(port, () => console.log(`App is running on server ${port}!`));
