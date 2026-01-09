import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

export const getMetrics = async (_: express.Request, res: express.Response) => {
  res.set('Content-Type', client.register.contentType);
  res.status(200).send(await client.register.metrics());
};

export const getHealth = (_: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK' });
};

export const getVersion = (_: express.Request, res: express.Response) => {
  const packagePath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  res.status(200).json({ version: packageJson.version });
};