import React, { useContext } from 'react'
import styles from "../styles/ShareButton.module.css";
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';

const ShareButton = ({ post, current }) => {
  const { user } = useContext(UserContext);

  const handleClick = (e) => {
      e.stopPropagation();
  }

  return (
    <div className={`${styles.box} ${(current) ? styles.current : ''}`}>
      <button className={styles.share} onClick={handleClick}><FontAwesomeIcon icon={faArrowUpFromBracket} /></button>
    </div>
  )
}

export default ShareButton
