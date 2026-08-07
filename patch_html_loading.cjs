const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<div id="root"></div>',
  '<div id="root"><div style="padding: 20px; text-align: center; font-family: sans-serif; color: #666;">Loading App...</div></div>'
);
fs.writeFileSync('index.html', html);
