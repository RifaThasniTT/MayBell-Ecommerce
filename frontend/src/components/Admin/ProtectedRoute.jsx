import React from 'react'
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
        return <Navigate to='/admin-login' />
    }

    return children;
}

export default AdminProtectedRoute
