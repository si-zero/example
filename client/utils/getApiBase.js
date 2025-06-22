export const getApiBase = () => {
    const forceLocal = import.meta.env.VITE_FORCE_LOCAL === "true"; // Vite에서 환경변수 접근
    const serverIp = "192.168.219.100";
    const clientIp = window.location.hostname;
  
    // dev2/dev3 실행 시 localhost 사용(개발 시에 사용할 로컬주소로 반환)
    if (forceLocal || clientIp === serverIp) {
      return "http://localhost:3001";
    }

    //      (시연 또는 실제 운영 시에 사용될 서버 주소를 반환)
    return `http://${serverIp}:3001`;
  };
  