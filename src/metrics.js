// const fs = require('fs');
// const path = require('path');
// function initMetrics() {
//   return {
//     success: 0,
//     failed: 0,
//     throttled: 0,
//     retries: 0,
//     totalTime: 0
//   };
// }

// function logMetrics(m) {
//   console.log(`\n--- 📊 Results ---`);
//   console.log(`✅ Success: ${m.success}`);
//   console.log(`🔁 429s: ${m.throttled}`);
//   console.log(`❌ Failed: ${m.failed}`);
//   console.log(`🔄 Retries: ${m.retries}`);
//   console.log(`⏱️ Avg Response Time: ${m.success > 0 ? (m.totalTime / m.success).toFixed(2) : 0} ms`);
// }

// function exportMetrics(m) {
//   return new Promise((resolve, reject) => {
//     fs.writeFile('results.json', JSON.stringify(m, null, 2), (err) => {
//       if (err) reject(err);
//       else resolve();
//     });
//   });
// }

// function generateHtmlReport(metrics) {
//   const html = `
//   <!DOCTYPE html>
//   <html>
//     <head>
//       <title>Rate Limit Test Report</title>
//       <style>
//         body { font-family: Arial; padding: 20px; }
//         h1 { color: #333; }
//         table { border-collapse: collapse; width: 50%; }
//         th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//         th { background-color: #f2f2f2; }
//       </style>
//     </head>
//     <body>
//       <h1>📄 Rate Limit Test Report</h1>
//       <table>
//         <tr><th>Metric</th><th>Value</th></tr>
//         <tr><td>✅ Success</td><td>${metrics.success}</td></tr>
//         <tr><td>🔁 429s</td><td>${metrics.throttled}</td></tr>
//         <tr><td>❌ Failed</td><td>${metrics.failed}</td></tr>
//         <tr><td>🔄 Retries</td><td>${metrics.retries}</td></tr>
//         <tr><td>⏱️ Avg Time</td><td>${metrics.success > 0 ? (metrics.totalTime / metrics.success).toFixed(2) : 0} ms</td></tr>
//       </table>
//     </body>
//   </html>
//   `;

//   fs.writeFileSync('report.html', html);
// }


// function saveToHistory(result) {
//   const resultsDir = path.join(__dirname, '../results');
//   const historyPath = path.join(resultsDir, 'history.json');

//   if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

//   const timestamp = new Date().toISOString();
//   const entry = { id: timestamp.replace(/[:.]/g, '-'), timestamp, ...result };

//   let history = [];
//   if (fs.existsSync(historyPath)) {
//     const existing = fs.readFileSync(historyPath, 'utf-8');
//     try {
//       history = JSON.parse(existing);
//     } catch {
//       console.warn('⚠️ Corrupted history.json. Starting fresh.');
//     }
//   }

//   history.push(entry);

//   // Optional: limit history to last N entries
//   const MAX_ENTRIES = 100;
//   if (history.length > MAX_ENTRIES) {
//     history = history.slice(history.length - MAX_ENTRIES);
//   }

//   fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
//   console.log(`📁 Run saved to history (${history.length} total runs).`);
// }

// module.exports = {
//   initMetrics,
//   logMetrics,
//   exportMetrics,
//   saveToHistory,
//   generateHtmlReport
// };


// // module.exports = { initMetrics, logMetrics, exportMetrics };



const fs = require('fs');
const path = require('path');

function initMetrics() {
  return {
    success: 0,
    failed: 0,
    throttled: 0,
    retries: 0,
    totalTime: 0, // total response time for successful requests
  };
}

function logMetrics(metrics) {
  console.log(`\n--- 📊 Results ---`);
  console.log(`✅ Success: ${metrics.success}`);
  console.log(`🔁 429s: ${metrics.throttled}`);
  console.log(`❌ Failed: ${metrics.failed}`);
  console.log(`🔄 Retries: ${metrics.retries}`);
  console.log(`⏱️ Avg Response Time: ${metrics.success > 0 ? (metrics.totalTime / metrics.success).toFixed(2) : 0} ms`);
}

function exportMetrics(metrics) {
  return new Promise((resolve, reject) => {
    fs.writeFile('results.json', JSON.stringify(metrics, null, 2), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function generateHtmlReport(metrics) {
  const avgTime = metrics.success > 0 ? (metrics.totalTime / metrics.success).toFixed(2) : 0;
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Rate Limit Test Report</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 50%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>📄 Rate Limit Test Report</h1>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>✅ Success</td><td>${metrics.success}</td></tr>
        <tr><td>🔁 429s</td><td>${metrics.throttled}</td></tr>
        <tr><td>❌ Failed</td><td>${metrics.failed}</td></tr>
        <tr><td>🔄 Retries</td><td>${metrics.retries}</td></tr>
        <tr><td>⏱️ Avg Time</td><td>${avgTime} ms</td></tr>
      </table>
    </body>
  </html>
  `;

  fs.writeFileSync('report.html', html);
}

/**
 * Saves the run summary to a single `history.json` file in results/
 * The new run entry includes all core fields expected by the dashboard
 * @param {Object} result - should contain all metrics + test config info
 * Example:
 * {
 *   url: "...",
 *   rps: 10,
 *   duration: 30,
 *   success: 100,
 *   throttled: 20,
 *   failed: 5,
 *   retries: 3,
 *   avgResponseTime: 150
 * }
 */
function saveToHistory(result) {
  const resultsDir = path.join(__dirname, '../results');
  const historyPath = path.join(resultsDir, 'history.json');

  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

  const timestamp = new Date().toISOString();
  const avgResponseTime = result.success > 0 ? (result.totalTime / result.success) : 0;

  // Build entry matching the dashboard's expected shape
  const entry = {
    id: timestamp.replace(/[:.]/g, '-'),
    timestamp,
    url: result.url || 'N/A',
    rps: result.rps || 0,
    duration: result.duration || 0,
    success: result.success || 0,
    throttled: result.throttled || 0,
    failed: result.failed || 0,
    retries: result.retries || 0,
    avgResponseTime: avgResponseTime,
  };

  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      const existing = fs.readFileSync(historyPath, 'utf-8');
      history = JSON.parse(existing);
    } catch {
      console.warn('⚠️ Corrupted history.json. Starting fresh.');
    }
  }

  history.push(entry);

  // Optional: keep only last 100 runs
  const MAX_ENTRIES = 100;
  if (history.length > MAX_ENTRIES) {
    history = history.slice(history.length - MAX_ENTRIES);
  }

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log(`📁 Run saved to history (${history.length} total runs).`);
}

module.exports = {
  initMetrics,
  logMetrics,
  exportMetrics,
  generateHtmlReport,
  saveToHistory
};
