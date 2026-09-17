import { create } from 'zustand';

export const appRoleValues = ['donor', 'hospital_staff', 'hospital_admin', 'system_admin'] as const;
export type AppRole = (typeof appRoleValues)[number];

interface AuthState {
  uid: string | null;
  phone: string | null;
  biometricLockEnabled: boolean;
  /**
   * UI navigation only — mirrors `users.role`'s "cosmetic/routing only"
   * status in docs/04SECURITY.md §3. Authority always comes from the Firebase
   * Auth custom claims token once real auth lands (Week 1 task 10, not yet
   * built); nothing privileged may ever branch on this value. It only picks
   * which route group (`(donor)` / `(hospital)` / `(admin)`) renders.
   */
  role: AppRole | null;
  setSignedIn: (params: { uid: string; phone?: string; role?: AppRole }) => void;
  setBiometricLockEnabled: (enabled: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  phone: null,
  biometricLockEnabled: false,
  role: null,
  setSignedIn: ({ uid, phone, role }) => set({ uid, phone: phone ?? null, role: role ?? 'donor' }),
  setBiometricLockEnabled: (enabled) => set({ biometricLockEnabled: enabled }),
  signOut: () => set({ uid: null, phone: null, role: null }),
}));
