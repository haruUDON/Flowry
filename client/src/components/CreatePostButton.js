import React, { useContext, useState } from 'react'
import styles from "../styles/CreatePostButton.module.css";
import { UserContext } from '../App';
import { useSnackbar } from './Snackbar';
import UploadImageButton from './UploadImageButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

function CreatePostButton() {
  const { user } = useContext(UserContext);
  const [activePopup, setActivePopup] = useState(false);
  const [text, setText] = useState('');
  const [img, setImg] = useState(null);
  const { showSnackbar } = useSnackbar();

  const togglePopup = (e) => {
    e.stopPropagation();
    setActivePopup(true);
    setText('');
    setImg(null);
  }

  const handleTextChange = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('image', img);

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
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
    }
  }

  return (
    <>
    <button className={styles.button} onClick={togglePopup}>投稿</button>
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
                className={img ? styles.textareaWithImage : styles.textareaDefault}
                placeholder="何かを投稿..."
                value={text}
                onChange={handleTextChange}
              />
              {img &&
                <div className={styles.previewContainer}>
                  <button className={styles.deletePreview} onClick={() => setImg(null)}><FontAwesomeIcon icon={faXmark} /></button>
                  <img src={URL.createObjectURL(img)} alt="Preview" className={styles.preview} />
                </div>
              }
            </div>
          </div>
          <div className={styles.line}></div>
          <div className={styles.bottom}>
            <div className={styles.tablist}>
              <UploadImageButton setImg={setImg} />
            </div>
            <div className={styles.submit}>
              <button disabled={text?.trim() || img ? false : true} onClick={() => handleSubmit()}>投稿</button>
            </div>
          </div>
        </div>
      </>
    }
    </>
  )
}

export default CreatePostButton
