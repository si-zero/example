export const getApiBase = () => {
  const forceLocal = import.meta.env.VITE_FORCE_LOCAL === "true"; // Vite 환경변수
  const localUrl = "http://localhost:3001";
  const railwayUrl = import.meta.env.VITE_RAILWAY_URL; // 배포된 Railway URL을 .env에 등록

  const serverIp = "192.168.219.103";
  const clientIp = window.location.hostname;

  // 개발 또는 특정 조건일 때 로컬 서버 사용
  if (forceLocal || clientIp === serverIp) {
    return localUrl;
  }

  // 운영(배포) 환경에서는 Railway URL 사용
  if (railwayUrl) {
    return railwayUrl;
  }

  // 기본 fallback (로컬 IP 서버)
  return `http://${serverIp}:3001`;
};
