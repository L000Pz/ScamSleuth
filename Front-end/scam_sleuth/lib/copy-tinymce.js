// lib/copy-tinymce.js
const fs = require("fs-extra");
const path = require("path");

const source = path.join(__dirname, "../node_modules/tinymce");
const destination = path.join(__dirname, "../public/tinymce");

fs.copySync(source, destination);
console.log("TinyMCE files copied to public/tinymce");
