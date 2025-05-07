import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import logger from '#utils/logger.js';
import SubmissionRoute from './routes/submit.js';
import EventRoute from './routes/event.js';

const app = express();
app.use(express.json());
app.use('/api', SubmissionRoute);
app.use('/api', EventRoute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'webapp', 'dist')));
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'webapp', 'dist', 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
  logger.info(`Web server is running on port ${process.env.PORT || 3000}`);
});
