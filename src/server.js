#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3005;

app.use(express.static(path.join(__dirname, '../public')));
app.use('/results', express.static(path.join(__dirname, '../results')));

app.get('/api/metrics', (req, res) => {
  fs.readFile('history.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Metrics not found' });
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`📊 Dashboard running at http://localhost:${PORT}/chart.html`);
});
