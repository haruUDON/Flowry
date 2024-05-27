import React, { useContext, useState } from 'react'
import styles from "../styles/CreatePostButton.module.css";
import { UserContext } from '../App';
import { useSnackbar } from './Snackbar';

function CreatePostButton() {
  const { user } = useContext(UserContext);
  const [activePopup, setActivePopup] = useState(false);
  const [text, setText] = useState('');
  const { showSnackbar } = useSnackbar();

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
        body: JSON.stringify({ text }),
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
    <button className={styles.button} onClick={() => setActivePopup(true)}>投稿</button>
    {activePopup &&
      <>
        <div className='blackBackground' onClick={() => setActivePopup(false)}></div>
        <div className={styles.popup}>
          <div className={styles.form}>
            <div className={styles.left}>
              <div className={styles.icon}>
                <img src={`data:image/jpeg;base64, ${user.icon}`} alt="Icon" className={styles.iconImg} />
              </div>
            </div>
            <div className={styles.right}>
              <textarea
                placeholder="何かを投稿..."
                value={text}
                onChange={handleTextChange}
              />
            </div>
          </div>
          <div className={styles.bottom}>
            <button className={styles.submit} disabled={text?.trim() ? false : true} onClick={() => handleSubmit()}>投稿</button>
          </div>
        </div>
      </>
    }
    </>
  )
}

export default CreatePostButton
