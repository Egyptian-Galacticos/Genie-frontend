import * as countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

export default function initializeCountries() {
  countries.registerLocale(enLocale);
  const countryData = countries.getNames('en', { select: 'official' });
  const countryList = Object.entries(countryData)
    .map(([code, name]) => ({ label: name, value: code }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return countryList;
}
