import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useContext(UserContext);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;