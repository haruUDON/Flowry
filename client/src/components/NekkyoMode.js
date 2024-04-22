import React, { useState } from 'react'
import styles from "../styles/NekkyoMode.module.css"
import AnimeList from './AnimeList';

function NekkyoMode() {
  const [activeMenu, setActiveMenu] = useState(false);

  return (
    <>
    <button className={styles.button} onClick={() => setActiveMenu(true)}>熱狂モード</button>
    {activeMenu &&
      <>
        <div className='blackBackground' onClick={() => setActiveMenu(false)}></div>
        <AnimeList />
      </>
    }
    </>
  )
}

export default NekkyoMode
