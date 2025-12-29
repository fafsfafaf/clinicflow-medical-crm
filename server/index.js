
import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { saveTokens, getTokens, deleteTokens } from './db.js';


// Fix dotenv path resolution
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try loading from root .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });


const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- CONFIG ---
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email'
];

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/oauth/google/calendar/callback' // Redirect URI (Proxied via Vite if needed, but Google calls this)
);

// MOCK USER ID (For single user local dev)
const USER_ID = 'default-admin';

// --- AUTH ENDPOINTS ---

// 1. Generate Auth URL
app.get('/api/oauth/google/url', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial for refresh_token
        scope: SCOPES,
        prompt: 'consent' // Force consent to ensure we get refresh_token
    });
    res.json({ url });
});

// 2. Handle Callback (Exchange code for tokens)
app.get('/api/oauth/google/calendar/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        saveTokens(USER_ID, tokens);

        // Get User Email for display
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        // Success redirect
        res.redirect(`http://localhost:3000/#/settings?status=success&email=${userInfo.data.email}`);
    } catch (error) {
        console.error('Auth Error:', error);
        res.redirect('http://localhost:3000/#/settings?status=error');
    }
});

// 3. Get Status
app.get('/api/oauth/status', (req, res) => {
    const tokens = getTokens(USER_ID);
    res.json({ isConnected: !!tokens });
});

// 4. Disconnect
app.post('/api/oauth/google/disconnect', (req, res) => {
    deleteTokens(USER_ID);
    res.json({ success: true });
});

// --- GOOGLE API PROXY ENDPOINTS ---

// Helper to get authenticated client
const getAuthClient = async () => {
    const dbTokens = getTokens(USER_ID);
    if (!dbTokens) throw new Error('Not connected');

    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    client.setCredentials({
        access_token: dbTokens.accessToken,
        refresh_token: dbTokens.refreshToken,
        expiry_date: dbTokens.expiryDate
    });

    // Auto refresh handling by googleapis
    client.on('tokens', (tokens) => {
        saveTokens(USER_ID, tokens);
        console.log('Tokens refreshed');
    });

    return client;
};

// GET Events
app.get('/api/google/calendar/events', async (req, res) => {
    try {
        const auth = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: req.query.start || new Date().toISOString(),
            timeMax: req.query.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        res.json(response.data.items);
    } catch (error) {
        console.error('Fetch Events Error:', error?.message);
        if (error?.message === 'Not connected') return res.status(401).json({ error: 'Not connected' });
        res.status(500).json({ error: error.message });
    }
});

// POST Event (Create)
app.post('/api/google/calendar/events', async (req, res) => {
    try {
        const auth = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: req.body,
        });

        res.json(response.data);
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH Event (Update)
app.patch('/api/google/calendar/events/:id', async (req, res) => {
    try {
        const auth = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.patch({
            calendarId: 'primary',
            eventId: req.params.id,
            requestBody: req.body,
        });

        res.json(response.data);
    } catch (error) {
        console.error('Update Event Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE Event
app.delete('/api/google/calendar/events/:id', async (req, res) => {
    try {
        const auth = await getAuthClient();
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: req.params.id,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
