import type { NextFunction, Request, Response } from 'express';

if (!process.env.BASIC_SECRET) {
  throw new Error('BASIC_SECRET environment variable is not defined');
}
const BASIC_SECRET: string = process.env.BASIC_SECRET;
 
export default function basicAuth(req: Request, res: Response, next: NextFunction) {
   try {
    const header = req.headers.authorization;
    if (!header) {
      throw new Error('No authorization header provided');
    }

    const [type, token] = header.split(' ');
    if (type !== 'Basic' || !token) {
      throw new Error('Invalid authorization format');
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    // Basic auth format is "username:password"
    const [_, password] = decoded.split(':');

    if (password !== BASIC_SECRET) {
       throw new Error('Invalid credentials');
    }
    
    next();
   } catch(error) {
        console.debug(error);
       res.status(401).json({ "error": "Unauthorized" });
   }
}