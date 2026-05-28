export type DateFilter = {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
};

export function matchesDateFilter(dateStr: string | undefined, filter: DateFilter): boolean {
  if (!filter.start && !filter.end) return true;
  if (!dateStr) return false;
  const start = filter.start ?? "0000-00-00";
  const end = filter.end ?? "9999-99-99";
  return dateStr >= start && dateStr <= end;
}

export function getDateFilterLabel(filter: DateFilter): string {
  if (!filter.start && !filter.end) return "날짜";
  const s = filter.start?.slice(5).replace("-", ".");
  const e = filter.end?.slice(5).replace("-", ".");
  if (s && e) return `${s} ~ ${e}`;
  if (s) return `${s} ~`;
  if (e) return `~ ${e}`;
  return "날짜";
}
