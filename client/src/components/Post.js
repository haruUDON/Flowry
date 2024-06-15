import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from "../styles/Post.module.css";
import { getTimeDifferenceString } from './TimeUtil';
import ReactionBox from './ReactionBox';
import PopupPostMenu from './PopupPostMenu';

const Post = ({ post, user, hidePost }) => {
  const [activeMenu, setActiveMenu] = useState(false);
  const navigate = useNavigate();

  if (user) post.user = user;

  const toggleActiveMenu = (boolean) => {
    setActiveMenu(boolean);
  }
  
  return (
    <div className={`${styles.post} ${!activeMenu && ( styles.hover )}`} onClick={() => navigate(`/post/${post._id}`, { state: { post } })}>
      <div className={styles.left}>
        <div className={styles.icon} onClick={(e) => {e.stopPropagation(); navigate(`/profile/${post.user._id}`, { state: { user: post.user } }); }}>
          <img src={`data:image/jpeg;base64, ${post.user.icon}`} alt="Icon" className={styles.iconImg} />
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.detail}>
          <span className={styles.displayName} onClick={(e) => {e.stopPropagation(); navigate(`/profile/${post.user._id}`, { state: { user: post.user } }); }}>
            {post.user.display_name.length > 20 ? post.user.display_name.slice(0, 20) + '...' : post.user.display_name}
          </span>
          <span className={styles.timestamp}>
            {getTimeDifferenceString(post.uploaded_at)}
          </span>
          {post.user.enthusiastic_anime &&
            <img src='/fire.png' alt="Fire" className={styles.fire} />
          }
        </div>
        <PopupPostMenu post={post} toggleActiveMenu={toggleActiveMenu} hidePost={hidePost} />
        <span className={styles.text}>{post.text}</span>
        {post.image &&
        <div className={styles.preview}>
          <img src={`/uploads/${post.user._id}/${post.image}`} alt="Preview" className={styles.previewImg} />
        </div>
        }
        <ReactionBox post={post} />
      </div>
    </div>
  )
}

export default Post
