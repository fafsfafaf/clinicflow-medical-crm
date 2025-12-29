
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve('tokens.json');

// Initialize DB
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

const readDb = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
};

const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

export const saveTokens = (userId, tokens) => {
    const db = readDb();

    // Keep existing refresh token if new one is missing
    let finalRefreshToken = tokens.refresh_token;
    if (!finalRefreshToken) {
        const existing = db[userId];
        if (existing) {
            finalRefreshToken = existing.refreshToken;
        }
    }

    db[userId] = {
        accessToken: tokens.access_token,
        refreshToken: finalRefreshToken,
        expiryDate: tokens.expiry_date
    };

    writeDb(db);
};

export const getTokens = (userId) => {
    const db = readDb();
    return db[userId];
};

export const deleteTokens = (userId) => {
    const db = readDb();
    delete db[userId];
    writeDb(db);
};
