import React, { useContext } from 'react'
import styles from "../styles/LikeButton.module.css";
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { useSnackbar } from './Snackbar';

const LikeButton = ({ post, current }) => {
  const { user, setUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();

  const handleClick = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post._id }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }

      const { success } = data;
      if (success) {
        showSnackbar(data.message);
        setUser(data.user);
      }
    } catch (err) {
      showSnackbar(err.message);
    }
  }

  return (
    <div className={`${styles.box} ${(current) ? styles.current : ''}`}>
      <button className={styles.like} onClick={handleClick}><FontAwesomeIcon icon={user.liked_posts.includes(post._id) ? faHeart : farHeart} /></button>
      <span className={styles.count}>{post.likes.length > 0 ? post.likes.length : null}</span>
    </div>
  )
}

export default LikeButton
