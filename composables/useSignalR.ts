import { useMSAuth } from "@/composables/useMSAuth";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export type NotificationResponse = {
  type: string;
  message: string;
  progressPerc: number;
  externalIdentifier: string;
};

const notificationResponse: Ref<NotificationResponse[]> = ref([]);
const spamCoinLoadProgress: Ref<NotificationResponse | null> = ref(null);
const reviewRecordProgress: Ref<NotificationResponse | null> = ref(null);
const taxCalculationProgress: Ref<NotificationResponse | null> = ref(null);

export const useSignalR = () => {
  const msAuth = useMSAuth();

  const initiateSignalR = async () => {
    const accessToken = await msAuth.acquireTokenSilent();

    const { apiBaseUrl } = useRuntimeConfig().public;
    const connection = new HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/realtimeNotifications`, {
        accessTokenFactory: () => accessToken as string,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection.on(
      "OnTxHistorySourceProgressUpdate",
      (data: NotificationResponse) => {
        notificationResponse.value.unshift(data);
      },
    );

    connection.on("onspamcoinanalysedprogressupdate", (data) => {
      spamCoinLoadProgress.value = data;
    });

    connection.on("onlistreviewrecordsprogressupdate", (data) => {
      reviewRecordProgress.value = data;
    });

    connection.on("OnTaxCalculationProgressUpdate", (data) => {
      taxCalculationProgress.value = data;
    });

    try {
      await connection.start();
    } catch (err) {
      console.error("Error while establishing connection:", err);
    }
  };

  return {
    initiateSignalR,
    notificationResponse,
    spamCoinLoadProgress,
    reviewRecordProgress,
    taxCalculationProgress
  };
};
