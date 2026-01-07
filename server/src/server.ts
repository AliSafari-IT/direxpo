import express from 'express';
import { createDirexpoRouter } from '@asafarim/direxpo-server';

const app = express();
app.use(express.json());

const { router } = createDirexpoRouter({ outputDir: '.output' });
app.use('/api', router);

const PORT = 5199;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
