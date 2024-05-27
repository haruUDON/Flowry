import React, { useContext, useState } from 'react'
import styles from "../styles/ReplyButton.module.css";
import { getTimeDifferenceString } from './TimeUtil';
import { UserContext } from '../App';
import { useSnackbar } from './Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-regular-svg-icons';

const ReplyButton = ({ post, current }) => {
  const { user } = useContext(UserContext);
  const [activePopup, setActivePopup] = useState(false);
  const [text, setText] = useState('');
  const { showSnackbar } = useSnackbar();

  const name = post.user.display_name.length > 20 ? post.user.display_name.slice(0, 20) + '...' : post.user.display_name;

  const togglePopup = (e) => {
      e.stopPropagation();
      setActivePopup(true);
  }

  const handleTextChange = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, parentId: post._id }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }

      const { success } = data;
      if (success) {
        setActivePopup(false);
        showSnackbar(data.message);
      }
    } catch (err) {
      showSnackbar(err.message);
      setText('');
    }
  }

  return (
    <>
    <div className={`${styles.box} ${(current) ? styles.current : ''}`}>
      <button className={styles.comment} onClick={togglePopup}><FontAwesomeIcon icon={faComment} /></button>
      <span className={styles.count}>{post.replies.length > 0 ? post.replies.length : null}</span>
    </div>
    {activePopup && (
      <div className={styles.group} onClick={(e) => e.stopPropagation()}>
        <div className='blackBackground' onClick={() => setActivePopup(false)}></div>
        <div className={styles.popup}>
          <div className={styles.current}>
            <div className={styles.left}>
              <div className={styles.icon}>
                <img src={`data:image/jpeg;base64, ${post.user.icon}`} alt="Icon" className={styles.iconImg} />
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.header}>
                <span className={styles.name}>
                  {name}
                </span>
                <span className={styles.timestamp}>
                  {getTimeDifferenceString(post.uploaded_at)}
                </span>
              </div>
              <span className={styles.content}>{post.text}</span>
            </div>
          </div>
          <div className={styles.line}></div>
          <div className={styles.form}>
            <div className={styles.left}>
              <div className={styles.icon}>
                <img src={`data:image/jpeg;base64, ${user.icon}`} alt="Icon" className={styles.iconImg} />
              </div>
            </div>
            <div className={styles.right}>
              <textarea
                placeholder="返信を投稿..."
                value={text}
                onChange={handleTextChange}
              />
            </div>
          </div>
          <div className={styles.bottom}>
            <button className={styles.submit} disabled={text?.trim() ? false : true} onClick={() => handleSubmit()}>返信</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default ReplyButton
