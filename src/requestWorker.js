const { parentPort, workerData } = require('worker_threads');
const axios = require('axios');

async function sendRequest() {
  const { url, method, headers, body } = workerData;

  try {
    const res = await axios({ url, method, headers, data: body });

    const result = {
      status: res.status,
      time: res.elapsedTime || 0
    };

    parentPort.postMessage(result);
  } catch (e) {
    parentPort.postMessage({ status: 'error' });
  }
}

sendRequest();
