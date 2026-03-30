// Vercel Serverless Function — Twilio Call Forwarding
// When someone calls your Twilio outreach number, it forwards to your personal phone
// Set FORWARD_TO_PHONE in Vercel env vars (your personal number)

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/xml');

    const forwardTo = process.env.FORWARD_TO_PHONE || '+12368880000'; // Ben's personal number

    // TwiML: forward the call to your personal phone
    // The caller ID will show the original caller's number so you know who's calling
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="${req.body?.From || req.query?.From || ''}">
        <Number>${forwardTo}</Number>
    </Dial>
</Response>`;

    return res.status(200).send(twiml);
}
