import { Fragment } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";
import KitchenDashboard from "./components/Dashboard/KitchenDashboard";
import StaffDashboard from "./components/Dashboard/StaffDashboard";
import CustomerDashboard from "./components/Dashboard/CustomerDashboard";
import Login from "./components/Login";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const App = () => {
  const { user } = useSelector((state) => state.auth);

  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "kitchen_staff":
        return <KitchenDashboard />;
      case "staff":
        return <StaffDashboard />;
      case "customer":
        return <CustomerDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Fragment>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={user ? renderDashboard() : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </Fragment>
  );
};

export default App;
