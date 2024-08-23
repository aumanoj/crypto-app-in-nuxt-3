import { useAppUser } from "#imports";
import { useMSAuth } from "@/composables/useMSAuth";
import { useSignalR } from "@/composables/useSignalR";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return;

  const msAuth = useMSAuth();
  const localePath = useLocalePath();
  const userStore = useAppUser();

  const { initiateSignalR } = useSignalR();

  let isAuthenticated = false;
  let accessToken: string | null = null;

  try {
    accessToken = await msAuth.acquireTokenSilent();
    isAuthenticated = msAuth.isAuthenticated() && !!accessToken;

    if (isAuthenticated) {
      const accounts = msAuth.getAccounts();
      if (accounts.length > 0) {
        const user = {
          ...accounts[0],
          isAuthenticated: true,
        };

        userStore.value.user = user;

        // Store minimal info in localStorage for persistence
        localStorage.setItem("userAccountId", accounts[0].homeAccountId);

        // Initialize SignalR after successful authentication
        await initiateSignalR();
      }
    } else {
      // If not authenticated, clear the user store
      userStore.value.user = null;
      localStorage.removeItem("userAccountId");
    }
  } catch (error) {
    console.error("Error acquiring token:", error);
    isAuthenticated = false;
    userStore.value.user = null;
    localStorage.removeItem("userAccountId");
  }

  if ((to.name as string)?.startsWith("dashboard") && !isAuthenticated) {
    return navigateTo(localePath("/"), { replace: true });
  } else if (to.path === "/" && isAuthenticated) {
    return navigateTo(localePath("/dashboard"), { replace: true });
  }
});