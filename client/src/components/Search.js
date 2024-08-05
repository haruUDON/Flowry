import React, { useMemo, useState } from 'react'
import Timeline from './Timeline';
import styles from "../styles/Search.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const Search = () => {
  let text = '';
  const [search, setSearch] = useState('');

  const handleSearchChange = (e) => {
    text = e.target.value;
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      setSearch(text);
    }
  };

  const query = useMemo(() => ({
    sort: 'desc',
    searchText: search
  }), [search]);

  return (
    <div className='timelineContainer'>
      <div className='postsContainer'>
        <div className={styles.search}>
          <div className={styles.left}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <div className={styles.right}>
            <input
              type="text"
              onChange={handleSearchChange}
              onKeyDown={handleEnter}
              placeholder="検索"
            />
          </div>
        </div>
        {search && 
          <Timeline query={query} />
        }
      </div>
    </div>
  )
}

export default Search
