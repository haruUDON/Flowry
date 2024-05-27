import React, { useState } from 'react'
import styles from "../styles/ReportButton.module.css";
import { useSnackbar } from './Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const ReportButton = ({ post, hidePost }) => {
  const [activePopup, setActivePopup] = useState(false);
  const [reason, setReason] = useState('');
  const { showSnackbar } = useSnackbar();

  const togglePopup = (e) => {
    e.stopPropagation();
    setActivePopup(true);
    setReason('');
  }

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/posts/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post._id, reason }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }

      const { success } = data;
      if (success) {
        setActivePopup(false);
        showSnackbar(data.message);
        hidePost(post);
      }
    } catch (err) {
      setActivePopup(false);
      showSnackbar(err.message);
    }
  }

  return (
    <>
    <button className={styles.report} onClick={togglePopup}><FontAwesomeIcon icon={faFlag} /> 報告</button>
    {activePopup && (
      <div onClick={(e) => e.stopPropagation()}>
        <div className='blackBackground' onClick={() => setActivePopup(false)}></div>
        <div className={styles.popup}>
          <div className={styles.header}>
            <button className={styles.close} onClick={() => setActivePopup(false)}><FontAwesomeIcon icon={faXmark} /></button>
          </div>
          <div className={styles.list}>
            <div className={styles.title}>
              <span>この投稿を報告する理由</span>
            </div>
            <label>
              <div className={styles.content}><span>ヘイトスピーチ</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="HATE_SPEECH" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>攻撃的な行為や嫌がらせ</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="HARASSMENT" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>暴力的な発言</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="VIOLENT_CONTENT" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>チャイルドセーフティ</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="CHILD_SAFETY" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>プライバシー</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="PRIVACY_VIOLATION" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>スパム</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="SPAM" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>自殺や自傷行為</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="SELF_HARM" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>ヌードや性的コンテンツ</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="SENSITIVE_CONTENT" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>虚偽の情報</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="FALSE_IDENTITY" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>暴力行為やヘイト行為の主体</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="VIOLENCE_HATE_SOURCE" onChange={handleReasonChange} /></div>
            </label>
            <label>
              <div className={styles.content}><span>悪質なネタバレ</span></div>
              <div className={styles.radio}><input type="radio" name="reportReason" value="SPOILER" onChange={handleReasonChange} /></div>
            </label>
          </div>
          <div className={styles.bottom}>
            <button className={styles.submit} onClick={handleSubmit} disabled={reason ? false : true}>送信</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default ReportButton
