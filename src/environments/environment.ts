export const environment = {
  production: process.env['NODE_ENV'] === 'production',
  apiUrl: process.env['API_URL'] || 'https://api.example.com',
  email: process.env['EMAIL'] || 'genienotify3@gmail.com',
  reverb: {
    host: process.env['REVERB_HOST'] || '127.0.0.1',
    port: process.env['REVERB_PORT'] || '8085',
    key: process.env['REVERB_KEY'] || 'my-app-key',
    scheme: process.env['REVERB_SCHEME'] || 'http',
  },
};
