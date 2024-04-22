import React from 'react'
import styles from "../styles/ReactionBox.module.css";
import ReplyButton from './ReplyButton';
import LikeButton from './LikeButton';
import BookmarkButton from './BookmarkButton';
import ShareButton from './ShareButton';

const ReactionBox = ({ post, current }) => {
  return (
    <div className={`${styles.container} ${(current) ? styles.current : ''}`}>
      <ReplyButton post={post} current={current} />
      <LikeButton post={post} current={current} />
      <BookmarkButton post={post} current={current} />
      <ShareButton post={post} current={current} />
    </div>
  )
}

export default ReactionBox
