import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    // Construct the route pattern
    // If request matched a route, req.route is defined. 
    // We combine baseUrl (if mounted) and route.path
    let route = req.baseUrl;
    if (req.route) {
        route += req.route.path;
    } else {
        // Fallback for 404s or unmatched routes: use the path but maybe label as "unknown" to avoid cardinality explosion?
        // For now using path is acceptable for simple usage, or custom label.
        route += req.path;
    }

    httpRequestDurationSeconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(durationInSeconds);
  });

  next();
};
