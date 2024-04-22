import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../App';
import styles from "../styles/Sidebar.module.css";

const Sidebar = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(false);
  const currentPath = location.pathname;

  const logout = () => {
    fetch('/logout').then(
      response => response.json()
    ).then(
      data => {
        if(data.success) window.location.reload();
      }
    ).catch(
      error => {
        console.error('Error fetching data:', error)
      }
    );
  }

  return (
    <>
      {activeMenu && ( <div className={styles.backgroundSidebarMenu} onClick={() => setActiveMenu(false)}></div> )}
      <ul className={styles.menu}>
      <li title="home"><Link to="/" className={(currentPath === '/') ? `${styles.active} ${styles.accessHome}` : styles.accessHome}>ホーム</Link></li>
      <li title="search"><Link to="/search" className={(currentPath === '/search') ? `${styles.active} ${styles.accessSearch}` : styles.accessSearch}>検索</Link></li>
      <li title="notifications">
        <Link to="/notifications" className={(currentPath === '/notifications') ? `${styles.active} ${styles.accessNotification}` : styles.accessNotification}>通知</Link>
        <div className={styles.notificationsCountBadge}>
          <span className={styles.notificationsCountNumber}></span>
        </div>
      </li>
      <li title="profile"><Link to={`/profile/${user._id}`} className={currentPath.includes('/profile') ? `${styles.active} ${styles.accessProfile}` : styles.accessProfile}>プロフィール</Link></li>
      <li title="bookmarks"><Link to="/bookmarks" className={(currentPath === '/bookmarks') ? `${styles.active} ${styles.accessBookmark}` : styles.accessBookmark}>ブックマーク</Link></li>
      <li title="messages"><Link to="#" className={styles.accessMessage}>メッセージ</Link></li>
      <div className={styles.menuIconContainer} onClick={() => setActiveMenu(true)}>
        <img src={`data:image/jpeg;base64, ${user.icon}`} alt="Icon" className={styles.iconImg} />
      </div>
      </ul>
      {activeMenu && (
        <div className={styles.userMenu}>
          <button>設定</button>
          <button onClick={() => logout()}>ログアウト</button>
        </div>
      )}
    </>
  );
};

export default Sidebar;