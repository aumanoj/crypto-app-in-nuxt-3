<script lang="ts" setup>
import type { TaxReports, TaxReportData } from "@/types/tax-report";
import { ErrorNotifier } from "#components";
import type { ErrorObject } from "~/types/api-instance";

const props = defineProps<{
  financialYearId: any;
}>();

const { $api } = useNuxtApp();
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);
const taxReportData: Ref<TaxReports | undefined> = ref();

const loadData = async () => {
  const { data, error } = await $api.taxReport.gettxReport(
    {},
    props.financialYearId
  );

  if (data.value) {
    taxReportData.value = data.value;
  } else if (error.value) {
    errorNotifier.value?.show(error.value as ErrorObject);
  }
};

const downloadReport = async (report: TaxReportData) => {
  try {
    report.isDownloading = true;

    if (!report.downloadUrl) {
      throw new Error("Download URL is missing");
    }

    const response = await $api.taxReport.callBlob("GET", report.downloadUrl);

    // Check if response is a Blob directly
    if (response instanceof Blob) {
      const url = window.URL.createObjectURL(response);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = report.name || "tax_report";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (response && typeof response === "object" && "blob" in response) {
      // If response is an object with a blob method
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = report.name || "tax_report";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Error downloading report:", error);
    let errorMessage = "Failed to download report";
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    errorNotifier.value?.show({ message: errorMessage } as ErrorObject);
  } finally {
    report.isDownloading = false;
  }
};

onMounted(async () => {
  loadData();
});
</script>
<template>
  <div>
    <div class="flex justify-start items-center mb-4 space-x-4 w-full">
      <UCard
        :ui="{
          ring: '',
          footer: {
            padding: 'py-4',
          },
          header: 'p-0 sm:p-0',
          base: 'overflow-hidden w-full',
        }"
        class="relative"
      >
        <ErrorNotifier ref="errorNotifier" />

        <div class="mb-4 mt-2">
          <div class="grid grid-cols-12">
            <strong class="col-span-4">Calculation Method:</strong>
            <span class="col-span-6">{{ taxReportData?.methodUsed }}</span>
          </div>
          <div class="grid grid-cols-12 mt-4">
            <strong class="col-span-2">Reports:</strong>
          </div>
          <!-- <div class="shadow-lg border-2 rounded-full"> -->

          
          <div
            class="grid grid-cols-12 p-2 shadow border-2 rounded mb-2"
            v-for="(report, index) in taxReportData?.reports"
            :key="index"
          >
            <div class="col-span-6 p-1">
              {{ report?.name }}
            </div>
            <div class="col-span-6 p-1">

              <UButton
                @click="downloadReport(report)"
                :disabled="report.isDownloading === true"
                class="w-full sm:w-auto"
                color="primary"
              >
                <span>{{
                  report.isDownloading ? "Downloading..." : "Download"
                }}</span>
              </UButton>
            </div>
            <div class="col-span-12 p-1">
              {{ report?.description }}
            </div>
          </div>
        </div>
        <!-- </div> -->
      </UCard>
    </div>
  </div>
</template>

<style></style>
