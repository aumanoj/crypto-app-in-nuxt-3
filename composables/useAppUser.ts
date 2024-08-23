import type { AccountInfo } from "@azure/msal-browser";

interface User extends Omit<AccountInfo, 'idToken' | 'idTokenClaims'> {
  isAuthenticated: boolean;
}

interface AppUserState {
  user: User | null;
  userImage: string | null;
}

export const useAppUser = () => {
  return useState<AppUserState>("user", () => ({
    user: null,
    userImage: null,
  }));
};