import { AuthRequest, DiscoveryDocument, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getDatabase } from '@/db';
import { backups } from '@/db/schema';
import { eq } from 'drizzle-orm';

WebBrowser.maybeCompleteAuthSession();

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || '';

const discovery: DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

function getRedirectUri() {
  return makeRedirectUri();
}

export async function signInToDrive(): Promise<string | null> {
  const clientId = CLIENT_ID;
  if (!clientId) {
    console.warn('EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID not configured. Set it in your .env file.');
    return null;
  }

  const redirectUri = getRedirectUri();
  const authRequest = new AuthRequest({
    clientId,
    scopes: SCOPES,
    redirectUri,
    usePKCE: true,
  });

  const result = await authRequest.promptAsync(discovery);
  if (result.type === 'success' && result.authentication?.accessToken) {
    return result.authentication.accessToken;
  }
  return null;
}

async function fetchWithAuth(url: string, accessToken: string, options: RequestInit = {}) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...(options.headers as Record<string, string> || {}),
  };
  return fetch(url, { ...options, headers });
}

export async function uploadBackupToDrive(
  accessToken: string,
  jsonContent: string,
  fileName: string,
): Promise<string | null> {
  try {
    const metadata = JSON.stringify({ name: fileName, mimeType: 'application/json' });
    const formData = new FormData();
    formData.append('metadata', { uri: `data:application/json;base64,${btoa(metadata)}`, type: 'application/json', name: 'metadata.json' } as any);
    formData.append('file', { uri: `data:application/json;base64,${btoa(jsonContent)}`, type: 'application/json', name: fileName } as any);

    const res = await fetchWithAuth(DRIVE_UPLOAD_URL, accessToken, { method: 'POST', body: formData });
    const data = await res.json();
    return data.id || null;
  } catch (err) {
    console.error('Drive upload failed:', err);
    return null;
  }
}

export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string,
): Promise<string | null> {
  try {
    const res = await fetchWithAuth(`${DRIVE_FILES_URL}/${fileId}?alt=media`, accessToken);
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.error('Drive download failed:', err);
    return null;
  }
}

export async function listBackupFiles(accessToken: string): Promise<{ id: string; name: string; createdTime: string }[]> {
  try {
    const res = await fetchWithAuth(
      `${DRIVE_FILES_URL}?q=mimeType='application/json' and name contains 'backup'&orderBy=createdTime desc&fields=files(id,name,createdTime)`,
      accessToken,
    );
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Drive list failed:', err);
    return [];
  }
}

export async function deleteBackupFromDrive(accessToken: string, fileId: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${DRIVE_FILES_URL}/${fileId}`, accessToken, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Drive delete failed:', err);
    return false;
  }
}

export function updateBackupDriveFileId(backupId: string, driveFileId: string | null) {
  const { db } = getDatabase();
  db.update(backups).set({ driveFileId }).where(eq(backups.id, backupId)).run();
}
