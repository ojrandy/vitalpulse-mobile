/**
 * Auth is Randy's own domain per docs/05DEVWORKFLOW.md §3, and real phone-OTP
 * sign-in needs a reCAPTCHA verifier strategy that hasn't been decided yet
 * (Firebase JS SDK + WebView verifier vs. @react-native-firebase/auth — see
 * the plan for this PR). This stub lets the onboarding screens be built and
 * clicked through end-to-end now; swap the implementation below for real
 * Firebase Auth calls once that decision is made, without touching any screen.
 */
export interface AuthService {
  sendOtp(phone: string): Promise<{ verificationId: string }>;
  verifyOtp(verificationId: string, code: string): Promise<{ uid: string }>;
  signInWithEmail(email: string, password: string): Promise<{ uid: string }>;
}

const STUB_DELAY_MS = 600;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService: AuthService = {
  async sendOtp(phone) {
    await delay(STUB_DELAY_MS);
    return { verificationId: `stub-verification-${phone}` };
  },
  async verifyOtp(verificationId, code) {
    await delay(STUB_DELAY_MS);
    if (!/^\d{6}$/.test(code)) {
      throw new Error('errorInvalid');
    }
    return { uid: `stub-uid-${verificationId}` };
  },
  async signInWithEmail(email) {
    await delay(STUB_DELAY_MS);
    return { uid: `stub-uid-${email}` };
  },
};
