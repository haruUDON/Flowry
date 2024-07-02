import React, { useContext, useMemo } from 'react'
import Timeline from './Timeline';
import { UserContext } from '../App';

const Home = () => {
  const { user } = useContext(UserContext);

  const from = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);

  const query = useMemo(() => ({
    fromDate: from,
    sort: 'desc',
    ...(user.enthusiastic_anime && { animeFilter: user.enthusiastic_anime._id }),
  }), [from, user]);

  return (
    <div className='timelineContainer'>
      <div className='postsContainer'>
        <Timeline query={query} />
      </div>
    </div>
  )
}

export default Home
