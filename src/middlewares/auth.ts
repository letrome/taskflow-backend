import type { NextFunction, Request, Response } from 'express';

if (!process.env.BASIC_SECRET) {
  throw new Error('BASIC_SECRET environment variable is not defined');
}
const BASIC_SECRET: string = process.env.BASIC_SECRET;
 
export default function basicAuth(req: Request, res: Response, next: NextFunction) {
   try {
    const type = req.headers.authorization?.split(' ')[0];
    if (type !== 'Basic') {
      throw new Error('Invalid authorization type');
    }
       const token = req.headers.authorization?.split(' ')[1];
       if (!token) {
         throw new Error('No token provided');
       }

       if(token !== BASIC_SECRET) {
         throw new Error('Invalid token');
       }
       next();
   } catch(error) {
        console.debug(error);
       res.status(401).json({ "error": "Unauthorized" });
   }
}