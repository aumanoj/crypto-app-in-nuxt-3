export type TaxCalculatorData = {
    calculationMethod: number,
    calculationMethodDisplay: string,
    applyCgtDiscount: boolean,
    showRunningBalanceForMoreSoldThanBuys: boolean,
    applyCgtDiscountText: string,
    canApplyCgtDiscount: boolean
};


export type PnlSummuryData = { 
  entries: Entries [],
  moreSoldThanBoughtValueTotal: number,
  pnLTotal: number,
  costBasisTotal: number,
  proceedsTotal: number,
  closingBalanceValueTotal: number
}


export type Entries = {
    mstbQty: number,
    mstbValue: number,
    coin: string,
    costBasis: number,
    proceeds: number,
    pnl: number,
    cbQty: number,
    cbValue: number,
    isNft: true,
    isIncOrExp: true 
}