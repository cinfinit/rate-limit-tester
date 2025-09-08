
# 🚀 Rate Limit Tester [![NPM version](https://img.shields.io/npm/v/rate-limit-tester.svg?style=flat)](https://www.npmjs.com/package/rate-limit-tester) [![NPM downloads](https://img.shields.io/npm/dm/rate-limit-tester.svg?style=flat)](https://npmjs.org/package/rate-limit-tester) 

**Hammer your APIs (ethically)** — Simulate bursts, test throttling, retry logic, and stress-test your rate limits like a civilized troublemaker.

---

## 🧠 What Is This?

`rate-limit-tester` is a **CLI + local dashboard tool** to simulate heavy traffic to any HTTP API, helping you answer:

- Will my API throttle under burst traffic?
- How does my retry logic handle `429` responses?
- What’s the max RPS my endpoint can take before it taps out?

---

## 🔧 Installation

```bash
npm install rate-limit-tester -g
```

---

## 🧪 CLI Usage


```bash
npx rate-limit-tester [options]
```

### 🌪️ Example Run

```bash
npx run rate-limit-tester \
  --url=https://api.example.com/data \
  --method=POST \
  --rps=150 \
  --duration=60 \
  --threads=true \
  --ramp-up=10 \
  --retry=true \
  --burst=false \
  --headers='{"Authorization":"Bearer token"}' \
  --body='{"query":"test"}'
```

---

## ⚙️ Supported Flags

| Flag         | Description                                  |
| ------------ | -------------------------------------------- |
| `--url`      | API endpoint to test (**required**)          |
| `--method`   | HTTP method (GET, POST, etc.)                |
| `--rps`      | Requests per second                          |
| `--duration` | Duration of test in seconds                  |
| `--threads`  | Enable real concurrency using worker threads |
| `--burst`    | Send all requests at once (ignores ramp-up)  |
| `--ramp-up`  | Gradually increase RPS over N seconds        |
| `--retry`    | Retry requests on `429` using `Retry-After`  |
| `--headers`  | JSON string of custom headers                |
| `--body`     | JSON string for request body (POST/PUT)      |

> 🧠 Tip: Use single quotes (`'`) around JSON CLI arguments to avoid shell escaping issues.

---

## 📈 Dashboard (Optional)

Visualize results after a run with a clean local dashboard.

### Start the dashboard:

```bash
npx run rate-limit-tester-server
```

Then open:

```
http://localhost:3005/chart.html
```

> 📉 Charts are **not live-streamed** — just refresh after a run to see updated results.

---

## 📊 Output Files

Each run creates:

* `results/history.json` – raw stats for your dashboard

Example output:

```
🚀 Test Complete

Total Requests:       1200
✅ Successful:         900
⚠️  Throttled (429):   250
❌ Failed:             50
🔁 Retried:            240
⏱️ Avg Response Time:  183ms

📁 Report saved to: report.html
```

---

## 🧪 Why Use This?

| Situation                    | Benefit                                                |
| ---------------------------- | ------------------------------------------------------ |
| You're building an API       | Test your rate-limiting middleware under stress        |
| You're using a 3rd-party API | Discover undocumented throttle behavior                |
| You implemented retry logic  | Validate it with real `429` bursts                     |
| You like graphs              | Dashboard. That’s it. No further justification needed. |

---


## 👨‍🔧 Contributing

PRs welcome. Memes too. Drop issues, improvements, or pull requests any time.

---

## 🧪 Built With


* A deep desire to break stuff (productively)

---

## ✍️ Author's Note

Built with 0 caffeine (yeah dont need it actually anymore)  and Chart.js by someone who got 429’d one too many times.
If it helps you ship safer APIs or impress your PM with a chart (dont need to impresss anyone, let your good work do the talking), then  my work here is done 😄

Enjoy breaking things (ethically)!
— [cinfinit](https://github.com/cinfinit)

