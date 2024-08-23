export type TaxReports = {
    methodUsed: string,
    reports: TaxReportData []
}


export type TaxReportData = {
    name: string,
    description: string,
    downloadUrl: string,
    reportType: number,
    isDownloading: Boolean
}