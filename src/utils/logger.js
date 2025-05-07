import pino from 'pino';
import fs from 'fs';
import path from 'path';

const logDir = path.join(import.meta.dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const prettyTransport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
});
const fileStream = pino.destination(path.join(logDir, 'app.log'));

const logger = pino(
  {
    level: 'debug',
  },
  pino.multistream([{ stream: prettyTransport }, { stream: fileStream }])
);

export default logger;
