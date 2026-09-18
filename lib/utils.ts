import crypto from 'crypto';
export function randomToken(){return crypto.randomBytes(32).toString('hex')}
export function verifyRazorpaySignature(payload:string,signature:string){const expected=crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET!).update(payload).digest('hex');return crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature))}
