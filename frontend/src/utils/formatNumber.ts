const englishNumberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatEnglishNumber(value: number, decimals = 1): string {
  if (decimals === 0) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return englishNumberFormatter.format(value);
}
