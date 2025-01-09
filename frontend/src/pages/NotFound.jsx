import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/User/Header';
import UserFooter from '../components/User/Footer';

function PageNotFound() {
  
    const navigate = useNavigate();

  return (
    <>
    <UserHeader />
    <div className="h-80 flex flex-col items-center justify-center text-center p-5 m-16">
      <h1 className="text-6xl font-bold text-violet-900 mb-5">404</h1>
      <p className="text-xl text-gray-700 mb-6">Page Not Found</p>
      <button
        onClick={() => navigate('/')}
        className="px-5 py-2 bg-violet-900 text-white rounded-lg hover:bg-blue-600"
      >
        Go to Home
      </button>
    </div>
    <UserFooter/>
    </>
  );
}

export default PageNotFound;
