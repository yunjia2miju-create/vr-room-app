const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<head>',
  '<head>\n    <script>\n      window.addEventListener("error", function(e) {\n        document.body.innerHTML = "<div style=\\"color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;\\"><h1>Global Error Caught</h1><pre>" + (e.error ? e.error.stack : e.message) + "</pre></div>";\n      });\n      window.addEventListener("unhandledrejection", function(e) {\n        document.body.innerHTML = "<div style=\\"color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;\\"><h1>Promise Rejection</h1><pre>" + (e.reason ? e.reason.stack || e.reason : e.reason) + "</pre></div>";\n      });\n    </script>'
);
fs.writeFileSync('index.html', html);
