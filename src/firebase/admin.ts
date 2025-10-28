'use server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseConfig } from './config';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  // This is a simplified credential setup for environments where
  // GOOGLE_APPLICATION_CREDENTIALS is set, like Firebase App Hosting.
  return initializeApp({
      projectId: firebaseConfig.projectId,
  });
}

export const adminApp = getAdminApp();
