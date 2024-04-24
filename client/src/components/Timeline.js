import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../styles/Timeline.module.css";
import { getTimeDifferenceString } from './TimeUtil';
import ReactionBox from './ReactionBox';
import PopupPostMenu from './PopupPostMenu';

const Timeline = (query) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(false);
    const navigate = useNavigate();

    const toggleActiveMenu = (boolean) => {
      setActiveMenu(boolean);
    }

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
                console.error('Error fetching data:', error)
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
          <div key={post._id} className={`${styles.post} ${!activeMenu && ( styles.hover )}`} onClick={() => navigate(`/post/${post._id}`, { state: { post } })}>
            <div className={styles.postFlex}>
              <div className={styles.postLeft}>
                <div className={styles.postIconContainer} onClick={(e) => {e.stopPropagation(); navigate(`/profile/${post.user._id}`, { state: { user: post.user } }); }}>
                  <img src={`data:image/jpeg;base64, ${post.user.icon}`} alt="Icon" className={styles.iconImg} />
                </div>
              </div>
              <div className={styles.postRight}>
                <p className={styles.postDetail}>
                  <span>
                    <span className={styles.displayName} onClick={(e) => {e.stopPropagation(); navigate(`/profile/${post.user._id}`, { state: { user: post.user } }); }}>
                      {post.user.display_name.length > 20 ? post.user.display_name.slice(0, 20) + '...' : post.user.display_name}
                    </span>
                  </span>
                  <span className={styles.timestamp}>
                    {getTimeDifferenceString(post.uploaded_at)}
                  </span>
                </p>
                <PopupPostMenu post={post} toggleActiveMenu={toggleActiveMenu} hidePost={hidePost} />
                <span className={styles.postContent}>{post.text}</span>
                <ReactionBox post={post} />
              </div>
            </div>
          </div>
        ))}
        <div className={styles.loading}>
        {loading && <div className={styles.spinner}></div>}
        </div>
    </>
  );
};

export default Timeline;