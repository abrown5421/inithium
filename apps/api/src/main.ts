import { createApp } from './server.js';
import { getConfig } from './config/env';

const { host, port } = getConfig();
const app = createApp();

app.listen(port, host, () => {
  console.log(`[ api ] listening at http://${host}:${port}`);
});
