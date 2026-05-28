import { useRef, useEffect } from "react";
import { View, Platform, ViewStyle } from "react-native";
import { NAVER_CLIENT_ID } from "../utils/mapKeys";
import { loadNaverSDK } from "../utils/naverSDK";

const WebView = Platform.OS !== "web" ? require("react-native-webview").WebView : null;

type Props = {
  lat: number;
  lng: number;
  height?: number;
  fill?: boolean;
  interactive?: boolean;
  borderRadius?: number;
};

export function NaverMapView({ lat, lng, height = 180, fill = false, interactive = false, borderRadius = 8 }: Props) {
  const webDivRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    loadNaverSDK(() => {
      const el = webDivRef.current;
      if (!el) return;
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

  const containerStyle: any = fill
    ? { flex: 1, borderRadius, overflow: "hidden" }
    : { height, width: "100%", borderRadius, overflow: "hidden" };

  if (Platform.OS === "web") {
    return <div ref={webDivRef} style={containerStyle} />;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=${interactive ? "3.0" : "1.0"}, user-scalable=${interactive ? "yes" : "no"}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}"></script>
  <script>
    var map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(${lat}, ${lng}),
      zoom: ${interactive ? 16 : 15}
    });
    new naver.maps.Marker({ position: new naver.maps.LatLng(${lat}, ${lng}), map: map });
    ${!interactive ? `map.setOptions({
      draggable: false,
      pinchZoom: false,
      scrollWheel: false,
      disableDoubleTapZoom: true,
      disableDoubleClickZoom: true,
      disableTwoFingerTapZoom: true
    });` : ""}
  </script>
</body>
</html>`;

  return (
    <View style={containerStyle}>
      <WebView
        source={{ html, baseUrl: "https://www.getitsju.com" }}
        scrollEnabled={false}
        javaScriptEnabled
        originWhitelist={["*"]}
        style={{ flex: 1 }}
      />
    </View>
  );
}
