import React from 'react'
import styles from "../styles/ShareButton.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from './Snackbar';

const ShareButton = ({ post, current }) => {
  const { showSnackbar } = useSnackbar();

  const handleClick = async (e) => {
    e.stopPropagation();
    const siteUrl = window.location.origin;
    const postLink = `${siteUrl}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(postLink);
      showSnackbar('クリップボードにコピーしました');
    } catch (err) {
      showSnackbar('コピー中にエラーが発生しました');
    }
  }

  return (
    <div className={`${styles.box} ${(current) ? styles.current : ''}`}>
      <button className={styles.share} onClick={handleClick}><FontAwesomeIcon icon={faArrowUpFromBracket} /></button>
    </div>
  )
}

export default ShareButton
