var fs = require('fs');
var path = require('path');

var targetPath = './src/environments/environment.production.ts';
var envConfigFile =
  'export const environment = {\n' +
  '  production: true,\n' +
  "  apiUrl: '" +
  (process.env.NG_APP_API_URL || 'https://api.example.com') +
  "',\n" +
  "  email: '" +
  (process.env.NG_APP_EMAIL || 'genienotify3@gmail.com') +
  "',\n" +
  '  reverb: {\n' +
  "    host: '" +
  (process.env.NG_APP_REVERB_HOST || 'your-reverb-host.com') +
  "',\n" +
  "    port: '" +
  (process.env.NG_APP_REVERB_PORT || '443') +
  "',\n" +
  "    key: '" +
  (process.env.NG_APP_REVERB_KEY || 'your-reverb-key') +
  "',\n" +
  "    scheme: '" +
  (process.env.NG_APP_REVERB_SCHEME || 'https') +
  "',\n" +
  '  },\n' +
  '};\n';

fs.writeFileSync(targetPath, envConfigFile);
console.log('Environment file generated successfully!');
