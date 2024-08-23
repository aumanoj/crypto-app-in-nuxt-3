type Transaction = {
  subExchangeName: string;
  net: number;
  tags: string[];
  notes: string;
  feeContractAddress: string;
  feeCoin: string | null;
  fee: number;
  txDateUtc: string;
  txDateLocal: string;
  tradeTypeDisplay: string;
  qty: number;
  currencyTokenId: string;
  currencyContractAddress: string;
  currency: string;
  recordTypeDisplay: string;
  symbolTokenId: string;
  symbolContractAddress: string;
  symbol: string;
  orderNo: string;
  id: number;
  orderNoUrl: string;
  otherOrderNoInfo: any[];
  exchangeName: string;
  exchangeId?: number;
  tradeType: number;
};

type TransactionMetadata = {
  minFromDateUtc: string;
  maxToDateUtc: string;
  subExchangesLookup: Record<string, string>;
  tagsLookup: Record<string, string>;
  symbolOrCurrencyLookup: string[];
  canShowSubExchangeDropdown: boolean;
};

export type { Transaction, TransactionMetadata };
