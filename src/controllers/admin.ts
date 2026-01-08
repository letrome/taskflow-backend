import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

export const getHealth = (_: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK' });
};

export const getVersion = (_: express.Request, res: express.Response) => {
  const packagePath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  res.status(200).json({ version: packageJson.version });
};