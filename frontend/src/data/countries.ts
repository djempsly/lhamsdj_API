export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "DO", name: "Dominican Republic", dial: "+1", flag: "\u{1F1E9}\u{1F1F4}" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "ES", name: "Spain", dial: "+34", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "FR", name: "France", dial: "+33", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "DE", name: "Germany", dial: "+49", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "IT", name: "Italy", dial: "+39", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "\u{1F1F5}\u{1F1F9}" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "\u{1F1E6}\u{1F1F7}" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "\u{1F1E8}\u{1F1F4}" },
  { code: "CL", name: "Chile", dial: "+56", flag: "\u{1F1E8}\u{1F1F1}" },
  { code: "PE", name: "Peru", dial: "+51", flag: "\u{1F1F5}\u{1F1EA}" },
  { code: "VE", name: "Venezuela", dial: "+58", flag: "\u{1F1FB}\u{1F1EA}" },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "\u{1F1EA}\u{1F1E8}" },
  { code: "PR", name: "Puerto Rico", dial: "+1", flag: "\u{1F1F5}\u{1F1F7}" },
  { code: "CU", name: "Cuba", dial: "+53", flag: "\u{1F1E8}\u{1F1FA}" },
  { code: "PA", name: "Panama", dial: "+507", flag: "\u{1F1F5}\u{1F1E6}" },
  { code: "CR", name: "Costa Rica", dial: "+506", flag: "\u{1F1E8}\u{1F1F7}" },
  { code: "GT", name: "Guatemala", dial: "+502", flag: "\u{1F1EC}\u{1F1F9}" },
  { code: "HN", name: "Honduras", dial: "+504", flag: "\u{1F1ED}\u{1F1F3}" },
  { code: "SV", name: "El Salvador", dial: "+503", flag: "\u{1F1F8}\u{1F1FB}" },
  { code: "NI", name: "Nicaragua", dial: "+505", flag: "\u{1F1F3}\u{1F1EE}" },
  { code: "UY", name: "Uruguay", dial: "+598", flag: "\u{1F1FA}\u{1F1FE}" },
  { code: "PY", name: "Paraguay", dial: "+595", flag: "\u{1F1F5}\u{1F1FE}" },
  { code: "BO", name: "Bolivia", dial: "+591", flag: "\u{1F1E7}\u{1F1F4}" },
  { code: "CA", name: "Canada", dial: "+1", flag: "\u{1F1E8}\u{1F1E6}" },
  { code: "JP", name: "Japan", dial: "+81", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "CN", name: "China", dial: "+86", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "IN", name: "India", dial: "+91", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "AU", name: "Australia", dial: "+61", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "\u{1F1F3}\u{1F1FF}" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "\u{1F1FF}\u{1F1E6}" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "\u{1F1F3}\u{1F1EC}" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "\u{1F1EA}\u{1F1EC}" },
  { code: "MA", name: "Morocco", dial: "+212", flag: "\u{1F1F2}\u{1F1E6}" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "\u{1F1E6}\u{1F1EA}" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "TR", name: "Turkey", dial: "+90", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "RU", name: "Russia", dial: "+7", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "PL", name: "Poland", dial: "+48", flag: "\u{1F1F5}\u{1F1F1}" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "\u{1F1F3}\u{1F1F1}" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "\u{1F1E7}\u{1F1EA}" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "\u{1F1E8}\u{1F1ED}" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "\u{1F1F8}\u{1F1EA}" },
  { code: "NO", name: "Norway", dial: "+47", flag: "\u{1F1F3}\u{1F1F4}" },
  { code: "DK", name: "Denmark", dial: "+45", flag: "\u{1F1E9}\u{1F1F0}" },
  { code: "FI", name: "Finland", dial: "+358", flag: "\u{1F1EB}\u{1F1EE}" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "\u{1F1EE}\u{1F1EA}" },
  { code: "AT", name: "Austria", dial: "+43", flag: "\u{1F1E6}\u{1F1F9}" },
  { code: "GR", name: "Greece", dial: "+30", flag: "\u{1F1EC}\u{1F1F7}" },
  { code: "IL", name: "Israel", dial: "+972", flag: "\u{1F1EE}\u{1F1F1}" },
  { code: "TH", name: "Thailand", dial: "+66", flag: "\u{1F1F9}\u{1F1ED}" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "\u{1F1F5}\u{1F1ED}" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "\u{1F1EE}\u{1F1E9}" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "\u{1F1F2}\u{1F1FE}" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "\u{1F1F8}\u{1F1EC}" },
  { code: "HT", name: "Haiti", dial: "+509", flag: "\u{1F1ED}\u{1F1F9}" },
  { code: "JM", name: "Jamaica", dial: "+1", flag: "\u{1F1EF}\u{1F1F2}" },
  { code: "TT", name: "Trinidad and Tobago", dial: "+1", flag: "\u{1F1F9}\u{1F1F9}" },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}
