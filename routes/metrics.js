/// By DevOps For Monitoring The Application

const express = require("express");
const client = require("prom-client");

const router = express.Router();

// Create a new counter metric for tracking the number of requests
const requestsCounter = new client.Counter({
  name: "requests_total",
  help: "Total number of requests",
});

// Create a new summary metric for tracking request latency
const latencySummary = new client.Summary({
  name: "request_latency",
  help: "Latency of requests",
  percentiles: [0.01, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.99],
});

// A middleware for counting requests and measuring latency
router.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.headers.host === "www.threadit.tech") {
      requestsCounter.inc();
      latencySummary.observe(duration);
    }
    console.log(`Request to ${req.headers.host}${req.path}`);
  });

  next();
});

// Create a metrics endpoint
router.get("/", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.end(metrics);
});

module.exports = router;
