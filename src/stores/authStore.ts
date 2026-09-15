import { create } from 'zustand';

interface AuthState {
  uid: string | null;
  phone: string | null;
  biometricLockEnabled: boolean;
  setSignedIn: (params: { uid: string; phone?: string }) => void;
  setBiometricLockEnabled: (enabled: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  phone: null,
  biometricLockEnabled: false,
  setSignedIn: ({ uid, phone }) => set({ uid, phone: phone ?? null }),
  setBiometricLockEnabled: (enabled) => set({ biometricLockEnabled: enabled }),
  signOut: () => set({ uid: null, phone: null }),
}));
