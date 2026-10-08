import { Platform } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { cacheDirectory, writeAsStringAsync } from "expo-file-system/legacy";

import { copy } from "@/content/businessCopy";
import { AppError } from "@/lib/errors/AppError";
import { copyDatabaseToCache } from "@/lib/backup/exportDatabase";
import { exportLocalDatabaseJson } from "@/lib/db/localRepository.ext";
import { driveBackupNamesForDate } from "../../../shared/backupArtifacts";

export { driveBackupNamesForDate } from "../../../shared/backupArtifacts";

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

async function uploadFileToDrive(
  token: string,
  fileName: string,
  localPath: string,
  mimeType: string,
  allowTokenRetry = true,
): Promise<string> {
  const metadata = JSON.stringify({
    name: fileName,
    mimeType,
  });

  const formData = new FormData();
  formData.append("metadata", {
    string: metadata,
    type: "application/json",
    name: "metadata",
  } as unknown as Blob);
  formData.append("file", {
    uri: toFileUri(localPath),
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(DRIVE_UPLOAD, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/related",
    },
    body: formData,
  });

  if (response.status === 401 && allowTokenRetry) {
    const refreshed = await GoogleSignin.getTokens();
    if (!refreshed.accessToken) {
      throw new AppError("AUTH", copy.errors.auth);
    }
    return uploadFileToDrive(
      refreshed.accessToken,
      fileName,
      localPath,
      mimeType,
      false,
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new AppError("BACKUP", copy.errors.backup, {
      technical: text,
    });
  }
  const json = (await response.json()) as { id?: string; name?: string };
  return json.name ?? fileName;
}

/**
 * Uploads SQLite + portable JSON copies to the user's Google Drive (Android).
 */
export async function backupDatabaseToGoogleDrive(): Promise<string> {
  const dbPath = await copyDatabaseToCache();
  const token = await getAccessToken();
  const isoDate = new Date().toISOString().slice(0, 10);
  const names = driveBackupNamesForDate(isoDate);

  const sqliteName = await uploadFileToDrive(
    token,
    names.sqlite,
    dbPath,
    "application/x-sqlite3",
  );

  const jsonPath = `${cacheDirectory}kuriosity_drive_export_${Date.now()}.json`;
  await writeAsStringAsync(jsonPath, exportLocalDatabaseJson());
  await uploadFileToDrive(token, names.json, jsonPath, "application/json");

  return sqliteName;
}
