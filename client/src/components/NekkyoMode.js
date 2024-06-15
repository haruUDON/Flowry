import React, { useContext, useState } from 'react'
import styles from "../styles/NekkyoMode.module.css"
import AnimeList from './AnimeList';
import { UserContext } from '../App';
import { useSnackbar } from './Snackbar';

function NekkyoMode() {
  const { user, setUser } = useContext(UserContext);
  const [activeMenu, setActiveMenu] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleLeaveNekkyoMode = async () => {
    try {
      const response = await fetch('/api/enthusiastic/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anime: null }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }

      const { success } = data;
      if (success) {
        showSnackbar(data.message);
        setUser(data.user);
      }
    } catch (err) {
      showSnackbar(err.message);
    }
  }

  return (
    <>
    {user.enthusiastic_anime ? (
      <div className={styles.card} onClick={handleLeaveNekkyoMode}>
        <span>{user.enthusiastic_anime.title}</span>
      </div>
    ) : (
      <button className={styles.button} onClick={() => setActiveMenu(true)}>熱狂モード</button>
    )}
    {activeMenu &&
      <>
        <div className='blackBackground' onClick={() => setActiveMenu(false)}></div>
        <AnimeList setActiveMenu={setActiveMenu} />
      </>
    }
    </>
  )
}

export default NekkyoMode
