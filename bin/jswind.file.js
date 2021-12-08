const http = require("http");
const { exec, execSync } = require("child_process");
const { writeFileSync, unlinkSync } = require("fs");

execSync("cd jswind && hide.exe");

let instances = 0;

class DesktopWindow {
  /** @private */
  _events = {};

  constructor(control, title, imports) {
    instances++;
    this.control = control;
    let importString = "";
    imports?.forEach((im) => {
      importString += `import ${im.import} from "../src/${im.from}";\n`;
    });
    const hta = `<!DOCTYPE html><html> <head> <meta http-equiv="x-ua-compatible" content="ie=11" /> <title>${
      title ?? `Window ${instances}`
    }</title> <script src="https://unpkg.com/modern-hta">${importString}\n window.eventSend = async (event, content) => { window.eventSend.event = event; window.eventSend.content = content; return new Promise((resolve, reject) => { let active = true; setInterval(() => { if(window.eventSend.response !== undefined && active) { resolve(window.eventSend.response); window.eventSend.response = undefined; active = false; } }) }) }; \n(${control})();\n </script> </head> <body> <script> setInterval(function () { if (window.eventSend.event) { const xhr = new XMLHttpRequest(); xhr.addEventListener("load", function () { if (this.responseText) { window.eventSend.response = JSON.parse(this.responseText); } else { window.eventSend.response = null; } }); xhr.open("POST", "http://localhost:${
      3000 + instances
    }/" + window.eventSend.event); xhr.send(JSON.stringify(window.eventSend.content)); window.eventSend.content = false; window.eventSend.event = false; } }); </script> </body></html>`;
    writeFileSync(`instances/in${instances}.hta`, hta);
    const server = http.createServer((req, res) => {
      req.on("data", (data) => {
        try {
          data = JSON.parse(data.toString());
        } catch (e) {
          data = data.toString();
        }
        res.writeHead(200, { "Content-Type": "text/json" });
        res.end(JSON.stringify(this._events[req.url.replace("/", "")]?.(data)));
      });
    });
    server.listen(3000 + instances);
    const proc = exec(`cd instances && in${instances}.hta`);
    this.process = proc;
    this.instance = instances;
    proc.on("exit", () => {
      unlinkSync(`instances/in${this.instance}.hta`);
      this.on._events?.close?.forEach((event) => {
        event();
      });
    });
  }

  addEvent(name, callback) {
    this._events[name] = callback;
  }

  on(name, callback) {
    if (!this.on._events)
      this.on._events = {
        close: [],
      };
    this.on._events[name].push(callback);
  }
}

DesktopWindow.EXIT_ON_CLOSE = process.exit;

module.exports = DesktopWindow;
