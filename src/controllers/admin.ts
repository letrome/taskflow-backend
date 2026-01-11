import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import type express from "express";
import client from "prom-client";
import User from "../models/user.js";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

export const getMetrics = async (_: express.Request, res: express.Response) => {
	res.set("Content-Type", client.register.contentType);
	res.status(200).send(await client.register.metrics());
};

export const getHealth = (_: express.Request, res: express.Response) => {
	res.status(200).json({ status: "OK" });
};

export const getVersion = (_: express.Request, res: express.Response) => {
	const packagePath = path.resolve(process.cwd(), "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
	res.status(200).json({ version: packageJson.version });
};

export const createUser = async (
	req: express.Request,
	res: express.Response,
) => {
	try {
		const hash = await bcrypt.hash(req.body.password, 10);
		const user = new User({
			email: req.body.email,
			password_hash: hash,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			roles: req.body.roles,
		});
		try {
			const savedUser = await user.save();
			res.status(201).json(savedUser);
		} catch (error) {
			res.status(400).json({ error });
		}
	} catch (error) {
		res.status(500).json({ error });
	}
};
