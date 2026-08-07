const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('console.error = function')) {
  html = html.replace(
    '<head>',
    '<head>\n    <script>\n      var oldError = console.error;\n      console.error = function() {\n        var msg = Array.from(arguments).join(" ");\n        var div = document.createElement("div");\n        div.style.cssText = "color:red;padding:10px;border-bottom:1px solid red;background:#fee;z-index:9999;position:relative;";\n        div.textContent = "CONSOLE ERROR: " + msg;\n        document.body.prepend(div);\n        oldError.apply(console, arguments);\n      };\n    </script>'
  );
  fs.writeFileSync('index.html', html);
}
