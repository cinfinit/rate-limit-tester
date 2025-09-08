#!/usr/bin/env node
// const { runTest } = require('./runner');

// // Parse args manually
// const args = process.argv.slice(2);
// const config = {};

// args.forEach((arg) => {
//   const [key, value] = arg.split('=');
//   config[key.replace('--', '')] = value;
// });

// if (!config.url) {
//   console.error('❌ Please provide a --url argument');
//   process.exit(1);
// }

// // Convert numeric args
// config.rps = parseInt(config.rps || '10');
// config.duration = parseInt(config.duration || '30');
// config.retry = config.retry === 'true';

// runTest(config);


const fs = require('fs');
const { runTest } = require('./runner');

// Default config
// let config = {
//   url: '',
//   method: 'GET',
//   rps: 10,
//   duration: 30,
//   retry: false,
//   burst: false,
//   headers: {},
//   body: null
// };

let config = {
  url: '',
  method: 'GET',
  rps: 10,
  duration: 30,
  retry: false,
  burst: false,
  headers: {},
  body: null,
  threads: false,
  rampUp: 0
};


// Read CLI args
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('--config=')) {
    const path = arg.split('=')[1];
    const file = fs.readFileSync(path, 'utf-8');
    config = { ...config, ...JSON.parse(file) };
  } else {
    const [key, value] = arg.replace('--', '').split('=');
    if (key === 'headers' || key === 'body') {
      config[key] = JSON.parse(value); // allow JSON via CLI
    }
    else if (key === 'threads') {
     config.threads = value === 'true';
    } else if (key === 'ramp-up') {
     config.rampUp = parseInt(value);
    } else {
      config[key] = isNaN(value) ? value : parseInt(value);
    }
  }
});

if (!config.url) {
  console.error('❌ Please provide a --url or --config file');
  process.exit(1);
}

runTest(config);
