import React, { createContext, useContext, useState, useEffect } from "react";

// Context 생성
const TitleContext = createContext();

// Provider 컴포넌트
export const TitleProvider = ({ children }) => {
  const [title, setTitle] = useState("기본 제목");

  useEffect(() => {
    const $title = document.getElementsByTagName("title")[0];
    if ($title) $title.textContent = title;
  }, [title]);

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

// Hook으로 export
// eslint-disable-next-line react-refresh/only-export-components
export const useTitle = () => useContext(TitleContext);
