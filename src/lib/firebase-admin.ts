'use server'
import admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set. Please add it to your .env.local file.');
    }
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error: any) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON: ${error.message}`);
    }
}

export const adminAuth = admin.auth();
