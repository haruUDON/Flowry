import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';

const UnAuthRoute = ({ children }) => {
    const { isAuthenticated } = useContext(UserContext);
    return isAuthenticated ? <Navigate to="/" /> : children;
};

export default UnAuthRoute;