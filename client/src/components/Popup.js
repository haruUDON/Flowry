import React, { useEffect } from 'react';
import { usePopup } from './PopupContext';
import styles from "../styles/Popup.module.css";

const Popup = () => {
  const { showPopup, setShowPopup, popupMessage } = usePopup();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showPopup, setShowPopup]);

  return (
    <div className={styles.popupResult}>
      <span>{popupMessage}</span>
    </div>
  );
};

export default Popup;