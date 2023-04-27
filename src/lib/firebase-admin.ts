import admin from 'firebase-admin';

try {
  admin.initializeApp({
    credential: admin.credential.cert('./src/lib/firebase-admin.json'),
    databaseAuthVariableOverride: null
  });
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  console.log('Initialized.');
} catch (error) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  if (error instanceof Error)
    if (!/already exists/u.test(error.message)) {
      console.error('Firebase admin initialization error', error.stack);
    }
}

export default admin;
