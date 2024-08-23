export type ReviewRecordItems = {
  total: number,
  totalPages: number,
  currentPage: number,
  results: ReviewRecordItem,
};

export type ReviewRecordItem = {
  direction: string,
  txDateUtc: string,
  txDateLocal: string,
  coin: string,
  qty: number,
  value: number,
  qtyDisplay:string,
  netDisplay: string,
  currency: string,
  orderNo: string,
  orderNoUrl: string,
  exchangeName: string,
  exchangeIdentifier: string,
  subExchangeName: string,
  commission: number,
  commissionCoin: string,
  tradeType: number,
  txHistoryId: number,
  correspondingRecordsSameSymbol: any[],
  correspondingRecordsSameValue: any[]
};


export type ReviewRecordFilters = {
  sourcesLookup: {
    additionalProp1: string,
    additionalProp2: string,
    additionalProp3: string,
  }
};
  
export type ReviewRecordEdit = {
  options: any[],
  relatedRecords: any[]
}

export type ReviewRecordUpdate = {
  convertedTxHistoryIds: any[]
  erroredTxHistoryIdInfos: {}
}