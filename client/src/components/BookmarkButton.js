import React, { useContext } from 'react'
import styles from "../styles/BookmarkButton.module.css";
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import { useSnackbar } from './Snackbar';

const BookmarkButton = ({ post, current }) => {
  const { user, setUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();

  const handleClick = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch('/api/posts/bookmark', {
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

      setUser(prevUser => ({
        ...prevUser,
        bookmarked_posts: data.user.bookmarked_posts
      }));

      if (data.isBookmarkedNow) {
        showSnackbar(data.message);
      }
    } catch (err) {
      showSnackbar(err.message);
    }
  }

  return (
    <div className={`${styles.box} ${(current) ? styles.current : ''}`}>
      <button className={styles.bookmark} onClick={handleClick}><FontAwesomeIcon icon={user.bookmarked_posts.includes(post._id) ? faBookmark : farBookmark} /></button>
      <span className={styles.count}>{post.bookmarks.length > 0 ? post.bookmarks.length : null}</span>
    </div>
  )
}

export default BookmarkButton
