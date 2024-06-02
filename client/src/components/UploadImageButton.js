import React, { useCallback, useRef } from 'react'
import styles from "../styles/UploadImageButton.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-regular-svg-icons';

const UploadImageButton = ({ setImg }) => {
  const inputRef = useRef(null);

  const onFileChange = useCallback(async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
      inputRef.current.value = '';
    }
  }, [setImg]);

  return (
    <label>
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={onFileChange}
        ref={inputRef}
      />
      <FontAwesomeIcon icon={faImage} className={styles.image} />
    </label>
  )
}

export default UploadImageButton
