import React from 'react'
import Timeline from './Timeline';

const Home = () => {

  const from = new Date();
  from.setDate(from.getDate() - 30);

  const query = {
    fromDate: from,
    sort: 'desc'
  }

  return (
    <div className='timelineContainer'>
      <div className='postsContainer'>
        <Timeline query={query} />
      </div>
    </div>
  )
}

export default Home
