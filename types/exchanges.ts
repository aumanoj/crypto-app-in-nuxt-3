export type IExchange = {
  id: number;
  logoUrl: string;
  name: string;
};

type ImportHtmlDescription = string;

type CsvSettings = {
  allowChangeDateTimezoneType: boolean;
  defaultDateTimezoneType: null;
};

type AddressSettings = {
  minLength: number;
  maxLength: number;
};

type ApiSettings = {
  hasApiKey: boolean;
  hasApiKeySecret: boolean;
  hasApiKeyPassphrase: boolean;
  maskedApiKey: null | string;
  maskedApiSecret: null | string;
  maskedApiPassPhrase: null | string;
  apiKeyDisplayName: string;
  apiSecretDisplayName: string;
  apiPassPhraseDisplayName: string;
};

type BaseImport = {
  importType: string;
  importName: string;
  importHtmlDescription: ImportHtmlDescription;
  exchangeId: number;
  exchangeImportTypeId: number;
  userFYearId: number;
};

export type CsvImport = BaseImport & {
  importType: "CSV";
  addressSettings: null;
  csvSettings: CsvSettings;
  apiSettings: null;
};

export type WalletAddressImport = BaseImport & {
  importType: "Address";
  addressSettings: AddressSettings;
  csvSettings: null;
  apiSettings: null;
};

export type ApiImport = BaseImport & {
  importType: "API";
  addressSettings: null;
  csvSettings: null;
  apiSettings: ApiSettings;
};

export type ImportConfig = CsvImport | WalletAddressImport | ApiImport;

export type TransactionImport = {
  canDisplayProgress: boolean;
  createdAtUtc: string;
  externalIdentifier: string;
  id: number;
  name: string;
  status: string;
  statusDetails: string;
  txCount: number | null;
  //refresh?: boolean;
  //close?: boolean;
  canRequeue: boolean
};

export type EmittedTransactionImportData = {
  imports: TransactionImport[];
  close?: boolean;
}
