
async function loadHistory() {
  const res = await fetch('/results/history.json');
  const history = await res.json();

  const tbody = document.querySelector('#history-table tbody');
  tbody.innerHTML = ''; // clear any existing rows

  history.reverse().forEach((run, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td><input type="checkbox" class="compare-checkbox" data-index="${index}" aria-label="Select run ${run.id} for comparison"></td>
      <td>${run.id}</td>
      <td>${new Date(run.timestamp).toLocaleString()}</td>
      <td>${run.url}</td>
      <td>${run.rps}</td>
      <td>${run.duration}s</td>
      <td>${run.success}</td>
      <td>${run.throttled}</td>
      <td>${run.failed}</td>
      <td>${run.avgResponseTime} ms</td>
    `;

    // Toggle individual chart on row click (except checkbox)
    row.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      toggleChart(run, index);
    });

    tbody.appendChild(row);

    // Create chart container (hidden initially)
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.id = `chart-${index}`;
    chartContainer.style.display = 'none'; // hidden initially
    chartContainer.innerHTML = `<canvas id="canvas-${index}" height="120" aria-label="Chart for run ${run.id}"></canvas>`;
    tbody.appendChild(chartContainer);
  });
}

function toggleChart(run, index) {
  const container = document.getElementById(`chart-${index}`);

  if (container.style.display === 'none' || container.style.display === '') {
    container.style.display = 'block';
    renderChart(run, `canvas-${index}`);
  } else {
    container.style.display = 'none';
  }
}

function renderChart(run, canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  // Clear previous chart instance if any to avoid overlap (important)
  if (ctx.chartInstance) {
    ctx.chartInstance.destroy();
  }


    const {success, throttled, failed} = run

  ctx.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Success', 'Throttled', 'Failed'],
      datasets: [{
        label: `Success`,
        data: [success, throttled, failed], 
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'] // green, amber, red
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#334155',
          titleColor: '#e0e7ff',
          bodyColor: '#f1f5f9',
          cornerRadius: 6,
          padding: 10,
        }
      },
      scales: {
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: '#475569' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#cbd5e1' },
          grid: { color: '#475569' }
        }
      }
    }
  });
}

document.getElementById('compare-button').addEventListener('click', () => {
  const selected = Array.from(document.querySelectorAll('.compare-checkbox:checked'));

  if (selected.length === 0) {
    alert('Please select at least one run to compare.');
    return;
  }
  const closeCompareButton = document.getElementById('close-compare-button');
 closeCompareButton.style.display = 'inline-block';
  fetch('/results/history.json')
    .then(res => res.json())
    .then(history => {
      // Reverse to match table ordering, then map selected indices to runs
      const reversedHistory = history.slice().reverse();
      const runs = selected.map(cb => reversedHistory[cb.dataset.index]);
      renderCompareChart(runs);
    });
});




document.getElementById('close-compare-button').addEventListener('click', () => {
  const compareCanvas = document.getElementById('compare-chart');
  
  // Hide the canvas or clear it
  compareCanvas.style.display = 'none';
    const closeCompareButton = document.getElementById('close-compare-button');
 closeCompareButton.style.display = 'none';
});

function renderCompareChart(runs) {
  const ctx = document.getElementById('compare-chart').getContext('2d');

  // Destroy previous chart if exists
  if (ctx.chartInstance) {
    ctx.chartInstance.destroy();
  }

  const labels = runs.map(r => r.id);
  const success = runs.map(r => r.success);
  const throttled = runs.map(r => r.throttled);
  const failed = runs.map(r => r.failed);

  ctx.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Success', data: success, backgroundColor: '#22c55e' },
        { label: 'Throttled', data: throttled, backgroundColor: '#f59e0b' },
        { label: 'Failed', data: failed, backgroundColor: '#ef4444' }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Comparison of Selected Runs',
          color: '#60a5fa',
          font: { size: 18, weight: '600' }
        },
        tooltip: {
          backgroundColor: '#334155',
          titleColor: '#e0e7ff',
          bodyColor: '#f1f5f9',
          cornerRadius: 6,
          padding: 10,
        },
        legend: {
          labels: { color: '#cbd5e1' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: '#475569' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#cbd5e1' },
          grid: { color: '#475569' }
        }
      }
    }
  });
}

// Load runs and build table on page load
loadHistory();
