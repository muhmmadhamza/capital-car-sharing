/** ISO timestamp `days` days before now (fractions allowed), so mock records always look recent. */
export const ago = (days: number): string => new Date(Date.now() - days * 86_400_000).toISOString();
