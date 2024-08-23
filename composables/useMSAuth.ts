import {
  BrowserCacheLocation,
  EventType,
  PublicClientApplication,
  type Configuration,
  type AuthenticationResult,
} from "@azure/msal-browser";
import { useAppUser } from "@/composables/useAppUser";

let tokenExpirationTimer: NodeJS.Timeout | null = null;
const msalTokenRenewalOffsetSeconds = 300;
const TOKEN_RENEWAL_OFFSET_MS = (msalTokenRenewalOffsetSeconds * 1000) + 1000; // Wait for 1 second (1000ms) after MSAL auto-refreshes the token.

export const useMSAuth = () => {
  const config = useRuntimeConfig();
  const scopes = [
    "openid",
    config.public.apiScope,
  ];
  const msalConfig = {
    auth: {
      clientId: config.public.clientId,
      authority: config.public.authority,
      redirectUri: config.public.redirectUri,
      resetPasswordUri: config.public.resetPasswordUri,
      postLogoutRedirectUri: config.public.postLogoutRedirectUri,
      navigateToLoginRequestUrl: true,
      knownAuthorities: [config.public.knownAuthority],
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: true,
    },
    system: {
      tokenRenewalOffsetSeconds: msalTokenRenewalOffsetSeconds,
    },
  };

  const msalInstance = useState(
      "msalInstance",
      () => new PublicClientApplication(msalConfig as Configuration),
  );

  async function initialize() {
    await msalInstance.value.initialize();

    // Handle redirect promise after login or redirect
    await msalInstance.value
      .handleRedirectPromise() // Handles the redirect promise and obtains the response
        .then(handleResponse)
        .catch((err) => {
        // Check for the AADB2C90118 error code
        if (
          err &&
          err.errorMessage &&
          err.errorMessage?.includes("AADB2C90118")
        ) {
          // User clicked "Forgot your password?"
          resetPassword(); // Call your resetPassword function here
        } else if (err.errorMessage?.includes("AADB2C90091")) {
          // User cancelled the operation
          handleSignUpCancellation();
        } else {
          // Handle other errors
          throw new Error(err);
        }
      });

    msalInstance.value.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const authResult = event.payload as AuthenticationResult;
        setupTokenExpirationTimer(authResult.expiresOn);
      }
    });
  }

  function handleSignUpCancellation() {
    window.location.href = "/";
  }

  async function handleResponse(resp: AuthenticationResult | null) {
    if (resp?.account) {
      const account = resp.account;
      const response = await msalInstance.value.acquireTokenSilent({
        account,
        scopes,
      });

      const fullApiUrl = `${config.public.apiBaseUrl}/Identity/SignUpSignIn`;
      await $fetch(fullApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      setupTokenExpirationTimer(response.expiresOn);
    }
  }

  async function resetPassword() {
    try {
      await msalInstance.value.loginRedirect({
        authority: msalConfig.auth.resetPasswordUri,
        scopes: loginRequest.scopes,
      });
    } catch (err) {
      console.error("Failed to redirect to password reset policy:", err);
    }
  }

  function setupTokenExpirationTimer(expiresOn: Date | null) {
    if (expiresOn) {
      const timeUntilExpiration = expiresOn.getTime() - Date.now();
      if (tokenExpirationTimer) clearTimeout(tokenExpirationTimer);

      tokenExpirationTimer = setTimeout(() => {
        acquireTokenSilent();
      }, timeUntilExpiration - TOKEN_RENEWAL_OFFSET_MS);
    }
  }

  const loginRequest = {
    scopes,
  };

  async function signIn() {
    try {
      await initialize();
      await msalInstance.value.loginRedirect(loginRequest);
    } catch (err) {
      console.log("Login error:", err);
    }
  }

  async function acquireTokenSilent() {
    await initialize();
    const accounts = msalInstance.value.getAllAccounts();

    if (accounts.length > 0) {
      const account = accounts[0];
      msalInstance.value.setActiveAccount(account);
      try {
        const response = await msalInstance.value.acquireTokenSilent({
          account,
          scopes,
        });
        setupTokenExpirationTimer(response.expiresOn);
        return response.accessToken;
      } catch (err) {
        console.error("Error acquiring token silently:", err);
        return acquireTokenInteractive();
      }
    } else {
      console.error("No accounts found");
      return null;
    }
  }

  async function acquireTokenInteractive() {
    try {
      const response = await msalInstance.value.acquireTokenPopup(loginRequest);
      setupTokenExpirationTimer(response.expiresOn);
      return response.accessToken;
    } catch (err) {
      console.error("Error acquiring token interactively:", err);
      return null;
    }
  }

  function getAccounts() {
    return msalInstance.value.getAllAccounts();
  }

  function isAuthenticated() {
    return getAccounts().length > 0;
  }

  async function signOut() {
    await initialize();
    const accounts = msalInstance.value.getAllAccounts();
    const account = accounts[0];
    if (account) {
      msalInstance.value.logoutRedirect({
        account,
      });
    } else {
      console.error("Account not found");
    }
  }

  return {
    initialize,
    msalInstance,
    signIn,
    getAccounts,
    acquireTokenSilent,
    isAuthenticated,
    signOut,
  };
};