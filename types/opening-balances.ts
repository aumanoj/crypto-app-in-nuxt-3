type ImportHtmlDescription = string;

type ImportType = "CSV" | "self";

export type OpeningBalancesImportType = {
    openingBalanceImportTypeId: number,
    importType: ImportType,
    importName: string,
    importHtmlDescription: ImportHtmlDescription,
    csvSettings: CsvSettings,
  };
  
  type CsvSettings = {
    allowChangeDateTimezoneType: boolean;
    defaultDateTimezoneType: null;
  };

  export type OpeningBalanceItems = {
    total: number,
    totalPages: number,
    currentPage: number,
    results: OpeningBalanceItem,
    importHtmlDescription: ImportHtmlDescription,
};

export type OpeningBalanceFilters = {
    sourcesLookup: {
      additionalProp1: string,
      additionalProp2: string,
      additionalProp3: string,
    }
};
  
export type CsvImport = OpeningBalancesImportType;
export type SelfImport = OpeningBalancesImportType;

export type ImportConfig = CsvImport | SelfImport;
  
export type OpeningBalanceItem = {
  source: string,
  coin: string,
  coinContractAddress: string,
  nftTokenId: string,
  qty: number,
  cost: number,
  boughtDate: string,
  id: number,
  qtyDisplay: string,
  costDisplay: string,
  status:string,
  refresh?: boolean;
  close?: boolean;
};
  