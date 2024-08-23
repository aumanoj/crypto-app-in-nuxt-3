export type ICountry = {
  id: string;
  name: string;
  localCurrency: string;
  isComingSoon: boolean;
  displayName: string;
};

type ICountryFYear = {
  id: number;
  fYear: string; // Assuming fYear is always a string like "2022-23", you could refine this with a more specific pattern if needed.
};

export type ICountryFYearDetails = {
  timeZoneIds: string[];
  countryFYears: ICountryFYear[];
  localCurrency: string; // You could also use a specific type or union if there are only certain valid currencies.
};

export type IUserDefaultFYearDetails = {
  id: number | null;
  fYearText: string;
  fYearStart: string | null;
  fYearEnd: string | null;
  selectedWizardStep: string;
  localCurrency: string;
  timeZoneId: string;
  needsNewSubscription: boolean;
  newSubscriptionCountryId: number | null;
  newSubscriptionCountryFYearId: number | null;
};

export type ISubscribeToFYearPayload = {
  countryFYearId: number;
  timeZoneId: string;
};
