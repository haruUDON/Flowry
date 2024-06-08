import React, { useEffect, useState } from 'react'
import styles from "../styles/Notifications.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Post from './Post';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hidePost = (post) => {
    const updatedNotifications = notifications.filter(n => n.post._id !== post._id);
    setNotifications(updatedNotifications);
  }

  useEffect( () => {
    setLoading(true);
    setNotifications([]);
    let isMounted = true;
    fetch('/api/notifications/get', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(),
    }).then(
      response => response.json()
    ).then(
      data => {
        if (isMounted) {
          setNotifications(data.notifications);
          setLoading(false);
        }
      }
    ).catch(
      error => {
        if (isMounted) setLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [])

  return (
    <div className='timelineContainer'>
      <div className='postsContainer'>
        {notifications.map((notice) => (
          <>
          {notice.type !== 'postReplied' &&
          <div className={styles.notice}>
            <div className={styles.left}>
              {notice.type === 'postLiked' &&
                <FontAwesomeIcon icon={faHeart} className={styles.heart} />
              }
              {notice.type === 'userFollowed' &&
                <FontAwesomeIcon icon={faUser} className={styles.follow} />
              }
            </div>
            <div className={styles.right}>
              <div className={styles.notificationIconContainer} onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notice.user._id}`, { state: { user: notice.user } }); } }>
                <img src={`data:image/jpeg;base64, ${notice.user.icon}`} alt="Icon" className={styles.iconImg} />
              </div>
              <div className={styles.title}>
                <span className={styles.displayName} onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notice.user._id}`, { state: { user: notice.user } }); } }>{notice.user.display_name}</span>
                <span>{notice.type === 'userFollowed' ? 'さんにフォローされました' : 'さんがあなたの投稿をいいねしました'}</span>
              </div>
              {notice.type === 'postLiked' &&
                <div className={styles.text}>
                  <span>{notice.post.text}</span>
                </div>
              }
            </div>
          </div>
          }
          {notice.type === 'postReplied' &&
            <Post post={notice.post} user={notice.user} hidePost={hidePost} />
          }
          </>
        ))}
        <div className={styles.loading}>
          {loading && <div className={styles.spinner}></div>}
        </div>
      </div>
    </div>
  )
}

export default Notifications
