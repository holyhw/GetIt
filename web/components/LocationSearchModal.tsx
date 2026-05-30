"use client";
import { useState, useEffect, useRef } from "react";

const API_BASE = "https://api.getitsju.com";

type Place = { name: string; address: string; lat: number; lng: number };

type Props = {
  visible: boolean;
  token: string | null;
  onSelect: (place: Place) => void;
  onClose: () => void;
};

export function LocationSearchModal({ visible, token, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || !token) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search/local?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const items = json.result?.items ?? [];
        setResults(items.map((item: any) => ({
          name: item.title?.replace(/<[^>]+>/g, "") ?? "",
          address: item.address ?? "",
          lat: parseInt(item.mapy) / 1e7,
          lng: parseInt(item.mapx) / 1e7,
        })));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center px-5 pt-8 pb-3 gap-3">
        <button onClick={onClose} className="cursor-pointer bg-transparent border-none p-1 shrink-0">
          <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
            <path d="M9.5 17.5L1.5 9.5L9.5 1.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2 bg-app-bg border border-app-border rounded-[12px] px-3 h-[44px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="7" stroke="#919191" strokeWidth="1.8" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#919191" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="장소를 검색해주세요"
            className="flex-1 text-sm text-black bg-transparent outline-none placeholder:text-[#ABABAB]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-app-gray text-lg leading-none bg-transparent border-none cursor-pointer">×</button>
          )}
        </div>
      </div>

      {/* 결과 */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center pt-12">
            <div className="w-6 h-6 border-2 border-app-gray-light border-t-navy rounded-full animate-spin" />
          </div>
        )}
        {!loading && !query && (
          <div className="flex justify-center pt-20">
            <p className="text-sm text-app-gray">장소명 또는 주소를 입력해주세요</p>
          </div>
        )}
        {!loading && query && results.length === 0 && (
          <div className="flex justify-center pt-20">
            <p className="text-sm text-app-gray">검색 결과가 없어요</p>
          </div>
        )}
        {results.map((r, i) => (
          <button
            key={i}
            onClick={() => { onSelect(r); onClose(); }}
            className="w-full px-5 py-4 text-left border-b border-[#F0F0F0] last:border-none cursor-pointer bg-transparent"
          >
            <p className="text-sm font-semibold text-black">{r.name}</p>
            <p className="text-xs text-app-gray mt-0.5">{r.address}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
