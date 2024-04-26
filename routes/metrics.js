/// By DevOps For Monitoring The Application

const express = require('express');
const client = require('prom-client');

const router = express.Router();

// Create a new counter metric for tracking the number of requests
const requestsCounter = new client.Counter({
  name: 'requests_total',
  help: 'Total number of requests',
});

// Create a new histogram metric for tracking request latency
const latencyHistogram = new client.Histogram({
  name: 'request_latency',
  help: 'Latency of requests',
  buckets: [0.01, 0.1, 5, 15, 50, 100, 500],  
});

// Create a new counter metric for tracking error rates
const errorCounter = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
});

// A middleware for counting requests and measuring latency
router.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {  // The 'finish' event is emitted when the response is sent
    const duration = Date.now() - start;
    requestsCounter.inc();
    latencyHistogram.observe(duration);
  });

  next();
});

// An example route that sometimes errors
router.get('/example', (req, res) => {
  if (Math.random() < 0.1) {  // 10% of requests will result in an error
    errorCounter.inc();
    res.status(500).send('An error occurred');
  } else {
    res.send('Success');
  }
});

// Create a metrics endpoint
router.get('/metrics', (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(client.register.metrics());
});

module.exports = router;