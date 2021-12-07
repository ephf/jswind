#!node

const { writeFileSync, readFileSync, existsSync, mkdirSync } = require("fs");
const paths = require("./paths.json");
const files = require("./files.json");
const dir = module.filename.replace(/\\jswind.js$|\\/g, "/");

paths.forEach((path) => {
  if (!existsSync(path)) mkdirSync(path);
});

Object.keys(files).forEach((name) => {
  if (!existsSync(name)) writeFileSync(name, files[name]);
});

writeFileSync("jswind/index.js", readFileSync(`${dir}jswind.file.js`));
writeFileSync("jswind/hide.exe", readFileSync(`${dir}hide.exe`));
