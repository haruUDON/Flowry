import React, { createContext, useState, useContext } from 'react';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  return (
    <PopupContext.Provider value={{ showPopup, setShowPopup, popupMessage, setPopupMessage }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);