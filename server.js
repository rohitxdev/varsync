import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import * as build from './build/server/index.js';

const app = express();

app.use(express.static('build/client'));
app.all('*', createRequestHandler({ build }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
