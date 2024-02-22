import 'dotenv/config.js';

import { UpdateVariableJob } from '../jobs/UpdateVariablesJob.js';

const job = new UpdateVariableJob({
  environmentId: process.argv[2],
  envFilePath: process.argv[3],
});

await job.execute();
