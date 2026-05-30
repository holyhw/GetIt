export type DateFilter = {
  start?: string;
  end?: string;
};

export function getDateFilterLabel(filter: DateFilter): string {
  if (!filter.start && !filter.end) return "날짜";
  const s = filter.start?.slice(5).replace("-", ".");
  const e = filter.end?.slice(5).replace("-", ".");
  if (s && e) return `${s} ~ ${e}`;
  if (s) return `${s} ~`;
  if (e) return `~ ${e}`;
  return "날짜";
}
