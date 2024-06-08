import React, { useState, useEffect } from 'react';
import styles from "../styles/Timeline.module.css";
import Post from './Post';

const Timeline = (query) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const hidePost = (post) => {
      const updatedPosts = posts.filter(p => p._id !== post._id);
      setPosts(updatedPosts);
    }

    useEffect(() => {
        setLoading(true);
        setPosts([]);
        let isMounted = true;

        fetch('/api/timeline', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        }).then(
            response => response.json()
        ).then(
            data => {
              if (isMounted) {
                setPosts(data.posts);
                setLoading(false);
              }
            }
        ).catch(
            error => {
                if (isMounted) setLoading(false);
            }
        );

        return () => {
          isMounted = false;
        };
    }, [query]);

    return (
      <>
        {posts.map((post) => (
          <Post post={post} hidePost={hidePost} key={post._id} />
        ))}
        <div className={styles.loading}>
        {loading && <div className={styles.spinner}></div>}
        </div>
    </>
  );
};

export default Timeline;