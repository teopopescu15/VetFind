import { Request, Response, NextFunction } from 'express';

interface Error {
  message: string;
  status?: number;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';

  console.error(`[ERROR] ${status} - ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};