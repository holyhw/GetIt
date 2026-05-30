const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!;

let loaded = false;
let callbacks: (() => void)[] = [];

export function loadNaverSDK(cb: () => void) {
  if (loaded) { cb(); return; }
  callbacks.push(cb);
  if (document.querySelector("script[data-naver-sdk]")) return;
  const s = document.createElement("script");
  s.setAttribute("data-naver-sdk", "true");
  s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`;
  s.onload = () => {
    loaded = true;
    callbacks.forEach((fn) => fn());
    callbacks = [];
  };
  document.head.appendChild(s);
}
