import { Platform } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { copy } from "@/content/businessCopy";
import { AppError } from "@/lib/errors/AppError";
import { copyDatabaseToCache } from "@/lib/backup/exportDatabase";

const DRIVE_UPLOAD =
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

let configured = false;

function ensureGoogleConfigured() {
  if (configured) return;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new AppError("BACKUP", copy.errors.backupNotConfigured);
  }
  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  configured = true;
}

async function getAccessToken(): Promise<string> {
  ensureGoogleConfigured();
  if (Platform.OS !== "android") {
    throw new AppError("BACKUP", copy.errors.backup);
  }
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const current = await GoogleSignin.getCurrentUser();
    if (!current) {
      await GoogleSignin.signIn();
    }
    const tokens = await GoogleSignin.getTokens();
    if (!tokens.accessToken) {
      throw new AppError("AUTH", copy.errors.auth);
    }
    return tokens.accessToken;
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new AppError("AUTH", copy.errors.authCancelled);
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new AppError("AUTH", copy.errors.auth);
      }
    }
    throw new AppError("BACKUP", copy.errors.backup, { cause: error });
  }
}

function toFileUri(path: string): string {
  return path.startsWith("file://") ? path : `file://${path}`;
}

export async function backupDatabaseToGoogleDrive(): Promise<string> {
  const dbPath = await copyDatabaseToCache();
  const token = await getAccessToken();
  const fileName = `mughals-family-${new Date().toISOString().slice(0, 10)}.db`;
  const metadata = JSON.stringify({
    name: fileName,
    mimeType: "application/x-sqlite3",
  });

  const formData = new FormData();
  formData.append("metadata", {
    string: metadata,
    type: "application/json",
    name: "metadata",
  } as unknown as Blob);
  formData.append("file", {
    uri: toFileUri(dbPath),
    name: fileName,
    type: "application/x-sqlite3",
  } as unknown as Blob);

  const response = await fetch(DRIVE_UPLOAD, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/related",
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new AppError("BACKUP", copy.errors.backup, {
      technical: text,
    });
  }
  const json = (await response.json()) as { id?: string; name?: string };
  return json.name ?? fileName;
}
