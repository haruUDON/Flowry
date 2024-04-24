import React, { useContext, useState } from 'react'
import styles from "../styles/PopupPostMenu.module.css";
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faFlag } from '@fortawesome/free-solid-svg-icons';
import DeleteButton from './DeleteButton';

const PopupPostMenu = ({ post, toggleActiveMenu, hidePost }) => {
  const { user } = useContext(UserContext);
  const [activePopup, setActivePopup] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setActivePopup(true);
    if (toggleActiveMenu) toggleActiveMenu(true);
  };

  const handleBackgroundClick = () => {
    setActivePopup(false);
    if (toggleActiveMenu) toggleActiveMenu(false);
  }

  return (
    <>
    <button className={styles.toggle} onClick={toggleMenu}><FontAwesomeIcon icon={faEllipsis} /></button>
    {activePopup && (
      <div className={styles.group} onClick={(e) => e.stopPropagation()}>
        <div className='clearBackground' onClick={handleBackgroundClick}></div>
        <div className={styles.menu}>
        {post.user._id === user._id ? (
          <DeleteButton post={post} hidePost={hidePost} />
        ) : (
          <button className={styles.report} data-postid={post._id}><FontAwesomeIcon icon={faFlag} /> 通報</button>
        )}
        </div>
      </div>
    )}
    </>
  )
}

export default PopupPostMenu
