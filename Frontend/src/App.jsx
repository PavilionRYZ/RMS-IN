import { Fragment } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import store from "./redux/store";
// import Login from "./components/LoginPage";

import { Navigate } from "react-router-dom";

const App = () => {
  console.log("Store:",store.getState());
  return (
    <Fragment>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </Fragment>
  );
};

export default App;
