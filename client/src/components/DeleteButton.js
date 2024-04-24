import React, { useState } from 'react'
import styles from "../styles/DeleteButton.module.css";
import { usePopup } from './PopupContext';
import Popup from './Popup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

const DeleteButton = ({ post, hidePost }) => {
  const [activePopup, setActivePopup] = useState(false);
  const { showPopup, setShowPopup, setPopupMessage } = usePopup();

  const togglePopup = (e) => {
    e.stopPropagation();
    setActivePopup(true);
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/posts/delete', {
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
        setActivePopup(false);
        setPopupMessage(data.message);
        setShowPopup(true);
        hidePost(post);
      }
    } catch (err) {
      setActivePopup(false);
      setPopupMessage(err.message);
      setShowPopup(true);
    }
  }

  return (
    <>
    <button className={styles.delete} onClick={togglePopup}><FontAwesomeIcon icon={faTrashCan} /> 削除</button>
    {activePopup && (
      <div onClick={(e) => e.stopPropagation()}>
        <div className='blackBackground' onClick={() => setActivePopup(false)}></div>
        <div className={styles.popup}>
          <div className={styles.title}>
            <span>投稿を削除しますか？</span>
          </div>
          <div className={styles.text}>
            <span>この操作は取り消すことが出来ません</span>
          </div>
          <div className={styles.submit}>
            <button onClick={() => handleSubmit()}>削除</button>
          </div>
          <div className={styles.cancel}>
            <button onClick={() => setActivePopup(false)}>キャンセル</button>
          </div>
        </div>
      </div>
    )}
    {showPopup && <Popup />}
    </>
  )
}

export default DeleteButton
