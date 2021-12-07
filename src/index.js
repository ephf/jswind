const http = require("http");
const { exec } = require("child_process");
const {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  readdirSync,
} = require("fs");
const srcDir = module.filename.replace(/\\index\.js$|\\/g, "/");
const instanceDir =
  module.filename.replace(/\\src\\index\.js$|\\/g, "/") + "instances/";

if (!existsSync(instanceDir)) {
  mkdirSync(instanceDir);
}

readdirSync(instanceDir).forEach((instance) => {
  unlinkSync(instanceDir + instance);
});

let instances = 0;

class DesktopWindow {
  /** @private */
  _events = {};

  constructor(control, title) {
    instances++;
    this.control = control;
    const hta = readFileSync(`${srcDir}index.hta`, "utf-8")
      .replace(/1%1/, `(${control.toString()})();`)
      .replace(/%title%/, `${title ?? `Window ${instances}`}`)
      .replace(/%port%/, 3000 + instances);
    writeFileSync(`${instanceDir}in${instances}.hta`, hta);
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
    const proc = exec(`${instanceDir}in${instances}.hta`);
    this.process = proc;
    this.instance = instances;
    proc.on("exit", () => {
      unlinkSync(`${instanceDir}in${this.instance}.hta`);
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
