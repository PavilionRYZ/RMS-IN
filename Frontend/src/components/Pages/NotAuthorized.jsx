import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import  Login from '../Auth/LoginPage';

const NotAuthorized = () => {
  const {user,isAuthenticated} = useSelector((state)=>state.auth);
  return (
 <Fragment>
  {user && isAuthenticated ? (
       <div className="min-h-screen flex items-center justify-center bg-gray-100">
       <div className="bg-white p-8 rounded-lg shadow-lg text-center">
         <h1 className="text-3xl font-bold text-gray-800 mb-4">Not Authorized</h1>
         <p className="text-gray-600 mb-6">
           You do not have the required permissions to access this page.
         </p>
         <Link
           to="/"
           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
         >
           Go to Home
         </Link>
       </div>
     </div>
  ):(
     <Login />
  )}
 </Fragment>
  );
};

export default NotAuthorized;