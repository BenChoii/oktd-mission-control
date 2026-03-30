// Vercel Serverless Function — Outreach SMS via Twilio
// Sends two-step outreach texts from Mission Control

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Missing required fields: to, message' });
    }

    // Twilio credentials from Vercel environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_OUTREACH_NUMBER; // 236 area code number for outreach

    if (!accountSid || !authToken || !twilioNumber) {
        return res.status(500).json({ error: 'Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_OUTREACH_NUMBER env vars.' });
    }

    // Format phone (ensure +1 prefix for Canada)
    const cleanPhone = to.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('From', twilioNumber);
    params.append('Body', message);

    try {
        const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await response.json();

        if (data.sid) {
            return res.status(200).json({ success: true, sid: data.sid, status: data.status });
        } else {
            return res.status(400).json({ success: false, error: data.message || 'Twilio error', code: data.code });
        }
    } catch (error) {
        console.error('SMS error:', error);
        return res.status(500).json({ error: 'Failed to send SMS' });
    }
}
