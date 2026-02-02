import app from './app.js';
import config from './config/env.js';
import connectDB from './config/db.js';
import { startDueRemindersJob } from './jobs/dueReminders.job.js';

/**
 * Server entry
 */

const start = async () => {
  await connectDB();

  // Start cron jobs
  startDueRemindersJob();

  const port = config.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port} (${config.NODE_ENV})`);
  });
};

start();

