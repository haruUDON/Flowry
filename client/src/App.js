import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from './components/Snackbar';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import UnAuthRoute from './components/UnAuthRoute';
import './App.css';
import Profile from './components/Profile';
import Post from './components/Post';
import NekkyoMode from './components/NekkyoMode';

export const UserContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    fetch('/api/auth/check').then(
      response => response.json()
    ).then(
      data => {
        setIsAuthenticated(data.isAuthenticated)
        setUser(data.user)
        setIsAuthenticating(false)
      }
    ).catch(
      error => {
        console.error('Error fetching data:', error)
        setIsAuthenticating(false)
      }
    )
  }, []);

  if (isAuthenticating) {
    return <div className='loading-container'>
      <span>Flowry</span>
    </div>;
  }

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={{ isAuthenticated, user, setUser }}>
          <SnackbarProvider>
            {isAuthenticated &&
              <>
              <Sidebar />
              <NekkyoMode />
              </>
            }
            <Routes>
              <Route
                path="/login"
                element={
                  <UnAuthRoute>
                    <Login />
                  </UnAuthRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <UnAuthRoute>
                    <Signup />
                  </UnAuthRoute>
                }
              />
              <Route
                exact
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/post/:postId"
                element={
                  <PrivateRoute>
                    <Post />
                  </PrivateRoute>
                }
              />
              <Route
                  path="*"
                  element={<Navigate to="/" replace />}
              />
            </Routes>
          </SnackbarProvider>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App