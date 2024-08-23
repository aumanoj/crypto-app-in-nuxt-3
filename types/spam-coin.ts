type CoinInfo = {
  logoUrl: string;
  exchangeName: string;
  coin: string;
  coinName: string;
  coinContractAddress: string;
  possibleSpam: boolean;
  firstSellTxIdentifier: string | null;
  firstBuyTxIdentifier: string | null;
  exchangeId: number;
  markedAsSpam: boolean;
  logoBase64String: string | null;
  uuid?: string;
};

export type { CoinInfo };
