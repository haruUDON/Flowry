import React, { createContext, useState, useContext, useEffect } from 'react';
import styles from "../styles/Popup.module.css";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [activeSnackbar, setActiveSnackbar] = useState(false);
  const [snackbarMessages, setSnackbarMessages] = useState([]);

  const showSnackbar = (newMessage) =>  {
    setSnackbarMessages(prevMessages => [...prevMessages, newMessage]);
    setActiveSnackbar(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeSnackbar){
        setSnackbarMessages(prevMessages => prevMessages.slice(1));
        setActiveSnackbar(false);
      }
      if (snackbarMessages.length > 1) {
        setActiveSnackbar(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [snackbarMessages, activeSnackbar]);

  return (
    <>
      <SnackbarContext.Provider value={{ showSnackbar }}>
        {children}
      </SnackbarContext.Provider>
      {activeSnackbar && (
        <div className={styles.popupResult}>
          <span>{snackbarMessages[0]}</span>
        </div>
      )}
    </>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);