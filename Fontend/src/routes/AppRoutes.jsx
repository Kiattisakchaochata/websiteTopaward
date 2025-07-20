import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BannerPage from "../admin/pages/BannerPage";
import PopularReviewPage from "../pages/PopularReviewPage";
import LoginPage from "../pages/LoginPage";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../admin/layouts/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import CategoryPage from "../admin/pages/CategoryPage";
import StorePage from "../admin/pages/StorePage";
import RegisterPage from "../pages/RegisterPage";
import StoreDetailPage from "../pages/StoreDetailPage"; // ✅ แก้ตรงนี้
import CategoryDetailPage from "../pages/CategoryDetailPage"; // ✅ แก้ตรงนี้
import CategoryListPage from "../pages/CategoryListPage";
import SearchPage from "../pages/SearchPage";


const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ User Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/popular-reviews" element={<PopularReviewPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/store/:id" element={<StoreDetailPage />} />
        <Route path="/category" element={<CategoryListPage />} /> 
        <Route path="/category/:id" element={<CategoryDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        
      </Route>

      {/* ✅ Admin Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="stores" element={<StorePage />} />
        <Route path="banners" element={<BannerPage />} />
        
      </Route>
    </Routes>
  );
};

export default AppRoutes;