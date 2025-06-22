import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainPage from "./pages/MainPage";
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import MyPage from "./pages/MyPage/Mypage";
import AddOrEditProductPage from "./pages/AddOrEditProductPage";
import { TitleProvider } from "./context/TitleContext";
import { LikedStoreProvider } from "./context/LikedStore";
import { UserProvider } from "./context/UserContext";
import { LoadingProvider } from "./context/LoadingContext";
import GlobalLoading from "./components/GlobalLoading"; 

function App() {
  return (
    <TitleProvider>
      <LoadingProvider>
        <UserProvider>
          <LikedStoreProvider>
            <Router>
              <GlobalLoading />
              <Routes>
                <Route path="/" element={<Navigate to="/main" replace />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product" element={<ProductDetailPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/Mypage" element={<MyPage />} />
                <Route
                  path="/edit-product"
                  element={<AddOrEditProductPage />}
                />
                <Route path="/add-product" element={<AddOrEditProductPage />} />
                <Route path="*" element={<Navigate to="/main" replace />} />
              </Routes>
            </Router>
          </LikedStoreProvider>
        </UserProvider>
      </LoadingProvider>
    </TitleProvider>
  );
}

export default App;
