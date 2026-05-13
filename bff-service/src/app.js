const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const apiRouter = require('./routes/apiRouter');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', apiRouter);

app.get('/health', (req, res) => res.json({ status: 'UP' }));

module.exports = app;