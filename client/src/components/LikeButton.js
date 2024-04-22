import React, { useContext } from 'react'
import styles from "../styles/LikeButton.module.css";
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

const LikeButton = ({ post, current }) => {
  const { user } = useContext(UserContext);

  const handleClick = (e) => {
      e.stopPropagation();
  }

  return (
    <div className={`${styles.box} ${(current) ? styles.current : ''}`}>
      <button className={styles.like} onClick={handleClick}><FontAwesomeIcon icon={user.liked_posts.includes(post._id) ? faHeart : farHeart} /></button>
      <span className={styles.count}>{post.likes.length > 0 ? post.likes.length : null}</span>
    </div>
  )
}

export default LikeButton
