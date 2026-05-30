"use client";
import { useRef, useEffect } from "react";
import { loadNaverSDK } from "@/lib/naverSDK";

type Props = {
  lat: number;
  lng: number;
  height?: number;
  interactive?: boolean;
  borderRadius?: number;
  className?: string;
};

export function NaverMapView({ lat, lng, height = 180, interactive = false, borderRadius = 8, className }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNaverSDK(() => {
      const el = mapRef.current;
      if (!el) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const naver = (window as any).naver;
      if (!naver?.maps) return;
      const map = new naver.maps.Map(el, {
        center: new naver.maps.LatLng(lat, lng),
        zoom: interactive ? 16 : 15,
      });
      new naver.maps.Marker({ position: new naver.maps.LatLng(lat, lng), map });
      if (!interactive) {
        map.setOptions({
          draggable: false,
          pinchZoom: false,
          scrollWheel: false,
          disableDoubleTapZoom: true,
          disableDoubleClickZoom: true,
          disableTwoFingerTapZoom: true,
        });
      }
    });
  }, [lat, lng, interactive]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ height, width: "100%", borderRadius, overflow: "hidden" }}
    />
  );
}
