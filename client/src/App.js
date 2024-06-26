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
import CurrentPost from './components/CurrentPost';
import NekkyoMode from './components/NekkyoMode';
import CreatePostButton from './components/CreatePostButton';
import Search from './components/Search';
import Notifications from './components/Notifications';
import io from 'socket.io-client';

export const UserContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetch('/api/auth/check').then(
      response => response.json()
    ).then(
      data => {
        setIsAuthenticated(data.isAuthenticated)
        setUser(data.user)
        setUnreadNotifications(data.user.notifications.filter(notification => !notification.is_read).length)
        setIsAuthenticating(false)

        if (data.isAuthenticated) {
          const socket = io('http://localhost:5000');

          socket.emit('register', data.user._id);
          
          socket.on('notification', () => {
            setUnreadNotifications((prev) => prev + 1);
          });

          return () => socket.disconnect();
        }
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
      <span>Animer</span>
    </div>;
  }

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={{ isAuthenticated, user, setUser }}>
          <SnackbarProvider>
            {isAuthenticated &&
              <>
              <Sidebar count={unreadNotifications} />
              <CreatePostButton />
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
                path="/search"
                element={
                  <PrivateRoute>
                    <Search />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/post/:postId"
                element={
                  <PrivateRoute>
                    <CurrentPost />
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