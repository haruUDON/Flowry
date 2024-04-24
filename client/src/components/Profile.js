import React, { useContext, useEffect, useState } from 'react'
import Timeline from './Timeline';
import { useLocation, useParams } from 'react-router-dom';
import { UserContext } from '../App';
import styles from "../styles/Profile.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import EditProfileButton from './EditProfileButton';

const Profile = () => {
  const { user } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const location = useLocation();

  useEffect(() => {
    //開かれたプロフィールがユーザー自身だったら
    if (user._id === userId){
      setCurrentUser(user);
      setLoading(false);
      return;
    }

    //ユーザー情報がすでに渡されていたら返す
    if (location.state && location.state.user) {
      setCurrentUser(location.state.user);
      setLoading(false);
      return;
    }

    let isMounted = true;

    fetch('/api/profile', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    }).then(
        response => response.json()
    ).then(
        data => {
          if (isMounted) {
            setCurrentUser(data.user);
            setLoading(false);
          }
        }
    ).catch(
        error => {
            console.error('Error fetching data:', error)
            if (isMounted) setLoading(false);
        }
    );

    return () => {
      isMounted = false;
    };
  }, [userId, location.state, user]);

  const query = {
    user: userId,
    sort: 'desc'
  }

  return (
    <div className='timelineContainer'>
      <div className='postsContainer'>
      {loading ? (
        <div className={styles.loading}>
            <div className={styles.spinner}></div>
        </div>
      ) : (
        <div className={styles.profile}>
          <div className={styles.profileHeader}>
            <div className={styles.profileIconContainer}>
              <img src={`data:image/jpeg;base64, ${currentUser.icon}`} alt="Icon" className={styles.iconImg} />
            </div>
            {currentUser._id === user._id ? (
              <EditProfileButton />
            ) : (
              <>
                <button className={styles.profileMenuButton}><FontAwesomeIcon icon={faEllipsis} /></button>
                <div className={styles.popupMenuProfile}>
                  <button className={styles.menuBlockButton} data-postid={currentUser._id}>
                    <FontAwesomeIcon icon={faBan} /> ブロック
                  </button>
                  <button className={styles.menuReportButton} data-postid={currentUser._id}>
                    <FontAwesomeIcon icon={faFlag} /> 通報
                  </button>
                </div>
                {user.following.some((follow) => follow === currentUser._id) ? (
                  <button id="follow-button" className={styles.cancelFollowButton} data-userid={currentUser._id}>
                    フォロー中
                  </button>
                ) : (
                  <button id="follow-button" className={styles.followButton} data-userid={currentUser._id}>
                    フォロー
                  </button>
                )}
              </>
            )}
          </div>
          <div className={styles.profileContent}>
            {currentUser.display_name && currentUser.display_name.match(/.{1,27}/g).map((name, index) => (
              <p key={index} className={styles.displayName}>
                {name}
              </p>
            ))}
            <p className={styles.profileUserId}>@{currentUser._id}</p>
            {currentUser.bio && currentUser.bio.match(/.{1,32}/g).map((bio, index) => (
              <p key={index} className={styles.profileBio}>
                {bio}
              </p>
            ))}
            <p className={styles.followContent}>
              <span>{currentUser.following.length} フォロー中</span>
              <span>{currentUser.followers.length} フォロワー</span>
            </p>
          </div>
        </div>
      )}
        <Timeline query={query} />
      </div>
    </div>
  )
}

export default Profile