import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);



  return (
  <Fragment>
    {/* left-side navigation sidebar */}
    <div className="left-side-navigation">
      
    </div>
    {/* right-side main content */}
  </Fragment>
  );
};

export default AdminDashboard;