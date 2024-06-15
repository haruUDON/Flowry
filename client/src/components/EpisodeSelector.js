import React, { useContext, useState } from 'react'
import styles from "../styles/EpisodeSelector.module.css";
import { useSnackbar } from './Snackbar';
import { UserContext } from '../App';

const EpisodeSelector = ({ anime, setActiveMenu }) => {
  const { setUser } = useContext(UserContext);
  const [episode, setEpisode] = useState(0);
  const { showSnackbar } = useSnackbar();
  
  const handleEpisodeChange = (event) => {
    const newEpisode = parseFloat(event.target.value);
    if (!isNaN(newEpisode)) {
      setEpisode(newEpisode);
    }
  };

  const handleStartNekkyoMode = async () => {
    try {
      const response = await fetch('/api/enthusiastic/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anime }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }

      const { success } = data;
      if (success) {
        showSnackbar(data.message);
        setActiveMenu(false);
        setUser({
          ...data.user,
          enthusiastic_anime: anime
        });
      }
    } catch (err) {
      showSnackbar(err.message);
    }
  }

  return (
    <div className={styles.menu}>
      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.card}>
            <span>{anime.title}</span>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.text}>
            <span>現在何話まで視聴しましたか？</span>
          </div>
          <div className={styles.count}>
            <span>{episode}/{anime.episodes_count}</span>
          </div>
          <div className={styles.slider}>
            <input
              type="range"
              min="0"
              max={anime.episodes_count}
              step="1"
              value={episode}
              onChange={handleEpisodeChange}
            />
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <button className={styles.start} onClick={handleStartNekkyoMode}>始める</button>
      </div>
    </div>
  )
}

export default EpisodeSelector
