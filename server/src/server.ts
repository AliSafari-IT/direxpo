import express from 'express';
import { createDirexpoRouter } from '@asafarim/direxpo-server';
import { createTreeRouter } from './tree-router.js';
import { createExportRouter } from './export-router.js';

const app = express();
app.use(express.json());

const { router: baseRouter } = createDirexpoRouter({ outputDir: '.output' });
const treeRouter = createTreeRouter();
const exportRouter = createExportRouter({ outputDir: '.output' });

app.use('/api/tree', treeRouter);
app.use('/api', exportRouter);
app.use('/api', baseRouter);

const PORT = 5199;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
