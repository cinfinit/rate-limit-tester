// // const axios = require('axios');
// // const { initMetrics, logMetrics, exportMetrics } = require('./metrics');
// // const { generateHtmlReport } = require('./metrics');

// // const { handleRetry } = require('./retry');

// // async function runTest(config) {
// //   const { url, rps, duration, retry } = config;
// //   const totalRequests = rps * duration;

// //   const metrics = initMetrics();
// //   const interval = 1000 / rps;

// //   console.log(`🚀 Starting test: ${rps} RPS for ${duration} seconds`);

// //   let sent = 0;
// //   const startTime = Date.now();

// //   const timer = setInterval(async () => {
// //     if (sent >= totalRequests) {
// //       clearInterval(timer);
// //       console.log('✅ Test complete.');
// //       logMetrics(metrics);
// //       await exportMetrics(metrics);
// //       generateHtmlReport(metrics);
// //       return;
// //     }

// //     sent++;

// //     const start = Date.now();
// //     try {
// //       const res = await axios.get(url); // You can expand method/support POST etc.
// //       const elapsed = Date.now() - start;

// //       if (res.status === 429) {
// //         metrics.throttled++;
// //         if (retry) {
// //           await handleRetry(res, url, metrics);
// //         }
// //       } else {
// //         metrics.success++;
// //         metrics.totalTime += elapsed;
// //       }
// //     } catch (err) {
// //       metrics.failed++;
// //     }
// //   }, interval);
// // }

// // // ...

// // module.exports = { runTest };



// const axios = require('axios');
// const { initMetrics, logMetrics, exportMetrics, generateHtmlReport } = require('./metrics');
// const { handleRetry } = require('./retry');

// async function runTest(config) {
//   const {
//     url, method, rps, duration, retry, burst, headers, body
//   } = config;

//   const metrics = initMetrics();
//   const totalRequests = rps * duration;
//   let sent = 0;
//   let active = true;

//   console.log(`🚀 Starting test on ${url}`);
//   console.log(`Method: ${method} | RPS: ${rps} | Duration: ${duration}s | Burst: ${burst}\n`);

//   const interval = burst ? 0 : 1000 / rps;
//   const startTime = Date.now();

//   const sendRequest = async () => {
//     if (!active || sent >= totalRequests) return;
//     sent++;

//     const start = Date.now();
//     try {
//       const res = await axios({
//         url,
//         method: method.toUpperCase(),
//         headers,
//         data: body
//       });

//       const elapsed = Date.now() - start;

//       if (res.status === 429) {
//         metrics.throttled++;
//         if (retry) await handleRetry(res, url, metrics, config);
//       } else {
//         metrics.success++;
//         metrics.totalTime += elapsed;
//       }
//     } catch (e) {
//       metrics.failed++;
//     }
//   };

//   // Timer
//   if (burst) {
//     for (let i = 0; i < totalRequests; i++) sendRequest();
//   } else {
//     const intervalId = setInterval(() => {
//       if (sent >= totalRequests) {
//         clearInterval(intervalId);
//         active = false;

//         setTimeout(() => {
//           logMetrics(metrics);
//           exportMetrics(metrics);
//           generateHtmlReport(metrics);
//         }, 1000);
//       } else {
//         sendRequest();
//       }
//     }, interval);
//   }

//   // If burst mode, wait and wrap up
//   if (burst) {
//     setTimeout(() => {
//       active = false;
//       logMetrics(metrics);
//       exportMetrics(metrics);
//       generateHtmlReport(metrics);
//     }, duration * 1000 + 1000);
//   }
// }

// module.exports = { runTest };



const axios = require('axios');
const { Worker } = require('worker_threads');
const { initMetrics, logMetrics, exportMetrics, generateHtmlReport  ,saveToHistory} = require('./metrics');
const { handleRetry } = require('./retry');

async function runTest(config) {
  const {
    url, method, rps, duration, retry, burst, headers, body,
    threads, rampUp
  } = config;

  console.log('the RPS thing , duration thing , retry thing , burst thing , headers thing , body thing', rps, duration);

  const totalRequests = rps * duration;
  const metrics = initMetrics();
  metrics.url = url;
  metrics.rps = rps;
  metrics.duration = duration;
  let sent = 0;
  const startTime = Date.now();

  console.log(`🚀 Starting test on ${url}`);
  console.log(`RPS: ${rps} | Duration: ${duration}s | Threads: ${threads} | Ramp-Up: ${rampUp}s | Burst: ${burst}\n`);

  const scheduleRequest = () => {
    if (sent >= totalRequests) return;
    sent++;

    if (threads) {
      const worker = new Worker('./src/requestWorker.js', {
        workerData: { url, method, headers, body }
      });

      worker.on('message', (result) => {
        if (result.status === 429) {
          metrics.throttled++;
          if (retry) handleRetry({ headers: { 'retry-after': 1 } }, url, metrics, config);
        } else if (result.status === 'error') {
          metrics.failed++;
        } else {
          metrics.success++;
          metrics.totalTime += result.time || 0;
        }
      });

      worker.on('error', () => {
        metrics.failed++;
      });
    } else {
      const start = Date.now();
      axios({ url, method, headers, data: body }).then((res) => {
        const elapsed = Date.now() - start;

        if (res.status === 429) {
          metrics.throttled++;
          if (retry) handleRetry(res, url, metrics, config);
        } else {
          metrics.success++;
          metrics.totalTime += elapsed;
        }
      }).catch(() => {
        metrics.failed++;
      });
    }
  };

  // --- Burst Mode ---
  if (burst) {
    for (let i = 0; i < totalRequests; i++) {
      scheduleRequest();
    }
    setTimeout(wrapUp, duration * 1000 + 1000);
    return;
  }

  // --- Ramp-Up Mode ---
  if (rampUp > 0) {
    const rampSteps = rampUp * 10; // update every 100ms
    let ramped = 0;

    const rampTimer = setInterval(() => {
      if (ramped >= rampSteps || sent >= totalRequests) {
        clearInterval(rampTimer);
        console.log('🚀 Ramp-up complete.');
        startSteadyLoad();
        return;
      }

      const currentRPS = Math.ceil((ramped / rampSteps) * rps);
      const requestsThisStep = Math.floor(currentRPS / 10); // 10x per second (every 100ms)

      for (let i = 0; i < requestsThisStep; i++) {
        if (sent < totalRequests) scheduleRequest();
      }

      ramped++;
    }, 100);

    return;
  }

  // --- Steady Load Mode ---
  startSteadyLoad();

  function startSteadyLoad() {
    const interval = 1000 / rps;

    const timer = setInterval(() => {
      if (sent >= totalRequests) {
        clearInterval(timer);
        wrapUp();
        return;
      }
      scheduleRequest();
    }, interval);
  }

  function wrapUp() {
    const finalMetrics = { url , ...metrics };
    setTimeout(() => {
      logMetrics(metrics);
      exportMetrics(metrics);
      saveToHistory(finalMetrics);
      generateHtmlReport(metrics);
    }, 1000);
  }

}




module.exports = { runTest };
