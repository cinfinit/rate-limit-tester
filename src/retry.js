// const axios = require('axios');

// async function handleRetry(res, url, metrics) {
//   metrics.retries++;

//   const retryAfter = parseInt(res.headers['retry-after']) || 1;

//   await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

//   try {
//     const retryRes = await axios.get(url);
//     if (retryRes.status === 200) {
//       metrics.success++;
//     }
//   } catch (e) {
//     metrics.failed++;
//   }
// }

// module.exports = { handleRetry };

const axios = require('axios');

async function handleRetry(res, url, metrics, config) {
  metrics.retries++;
  const retryAfter = parseInt(res.headers['retry-after']) || 1;

  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

  try {
    const retryRes = await axios({
      url,
      method: config.method || 'GET',
      headers: config.headers || {},
      data: config.body || null
    });

    if (retryRes.status === 200) {
      metrics.success++;
    }
  } catch (e) {
    metrics.failed++;
  }
}

module.exports = { handleRetry };
