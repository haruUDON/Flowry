import React, { useContext, useState } from 'react'
import styles from "../styles/ReplyForm.module.css";
import { UserContext } from '../App';
import { useSnackbar } from './Snackbar';
import { useNavigate } from 'react-router-dom';

const ReplyForm = ({ post }) => {
  const { user } = useContext(UserContext);
  const [text, setText] = useState('');
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

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
        showSnackbar(data.message);
        setText('');
        
      }
    } catch (err) {
      showSnackbar(err.message);
    }
  }

  return (
    <div className={styles.box}>
      <div className={styles.form}>
        <div className={styles.left}>
          <div className={styles.icon} onClick={() => navigate(`/profile/${user._id}`, { state: { user } })}>
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
  )
}

export default ReplyForm
