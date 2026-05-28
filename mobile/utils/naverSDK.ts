import { NAVER_CLIENT_ID } from "./mapKeys";

let _loaded = false;
let _callbacks: (() => void)[] = [];

export function loadNaverSDK(cb: () => void) {
  if (_loaded) { cb(); return; }
  _callbacks.push(cb);
  if (document.querySelector("script[data-naver-sdk]")) return;
  const s = document.createElement("script");
  s.setAttribute("data-naver-sdk", "true");
  s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}&submodules=geocoder`;
  s.onload = () => {
    _loaded = true;
    _callbacks.forEach((fn) => fn());
    _callbacks = [];
  };
  document.head.appendChild(s);
}
