import React, { useEffect, useRef, useState } from 'react'
import styles from "../styles/AnimeList.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import EpisodeSelector from './EpisodeSelector';

function AnimeList({ setActiveMenu }) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [anime, setAnime] = useState([]);
  const [activeAnime, setActiveAnime] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const containerRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    let isMounted = true;
    setActiveAnime(null);
    setSelectedAnime(null);

    const fetchData = () => {
      setLoading(true);
      fetch('/api/anime', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search, gotAnimeIds: [] }),
      }).then(
          response => response.json()
      ).then(
          data => {
            if (isMounted) {
              setAnime(data.anime);
              setLoading(false);
            }
          }
      ).catch(
          error => {
              if (isMounted) setLoading(false);
          }
      );
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [search]);

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (loading) return;

      setLoading(true);
      fetch('/api/anime', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search, gotAnimeIds: anime.map(a => a._id) }),
      }).then(
          response => response.json()
      ).then(
          data => {
            const newData = data.anime;
            setAnime(prevData => [...prevData, ...newData]);
            setLoading(false);
          }
      ).catch(
          error => {
              console.error('Error fetching data:', error)
              setLoading(false);
          }
      );
    }
  };

  const clickAnime = (anime) => {
    setActiveAnime(anime);
  }

  return (
    <>
      {!selectedAnime ? (
      <div className={styles.menu}>
        <div className={styles.search}>
          <div className={styles.searchLeft}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.glass} />
          </div>
          <div className={styles.searchRight}>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="検索"
            />
          </div>
        </div>
        <div className={styles.list} onScroll={handleScroll} ref={containerRef}>
          <div className={styles.cards}>
            {anime.map((a) => (
              <div key={a.id} className={`${styles.card} ${(activeAnime === a) ? styles.active : ''}`} onClick={() => clickAnime(a)}>
              <span>{a.title}</span>
              </div>
            ))}
            <div className={styles.loading}>
              {loading && <div className={styles.spinner}></div>}
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <button className={styles.next} disabled={activeAnime ? false : true} onClick={() => setSelectedAnime(activeAnime)}>次へ</button>
        </div>
      </div>
      ) : (
        <EpisodeSelector anime={activeAnime} setActiveMenu={setActiveMenu} />
      )}
    </>
  )
}

export default AnimeList
