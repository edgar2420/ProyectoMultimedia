import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
