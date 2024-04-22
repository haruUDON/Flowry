import React, { useContext } from 'react'
import styles from "../styles/BookmarkButton.module.css";
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';

const BookmarkButton = ({ post, current }) => {
  const { user } = useContext(UserContext);

  const handleClick = (e) => {
      e.stopPropagation();
  }

  return (
    <div className={`${styles.box} ${(current) ? styles.current : ''}`}>
      <button className={styles.bookmark} onClick={handleClick}><FontAwesomeIcon icon={user.bookmarked_posts.includes(post._id) ? faBookmark : farBookmark} /></button>
      <span className={styles.count}>{post.bookmarks.length > 0 ? post.bookmarks.length : null}</span>
    </div>
  )
}

export default BookmarkButton
