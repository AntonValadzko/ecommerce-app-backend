/** Postgres NUMERIC/DECIMAL columns are returned as strings by the `pg` driver. */
export function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === '') return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function toOptionalNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
}
