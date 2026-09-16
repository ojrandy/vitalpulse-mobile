export interface NotificationPrefs {
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
  push: boolean;
}

/**
 * Stub for the client-writable `users.notificationPrefs` field (see
 * docs/03DATAMODEL.md) — a direct Firestore write by the owning donor, not a
 * Cloud Function. Wired to real Firestore in the backend phase.
 */
const STUB_DELAY_MS = 400;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const profileService = {
  async updateNotificationPrefs(prefs: NotificationPrefs): Promise<NotificationPrefs> {
    await delay(STUB_DELAY_MS);
    return prefs;
  },
};
