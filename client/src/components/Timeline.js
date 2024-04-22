import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import styles from "../styles/Timeline.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faFlag, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { getTimeDifferenceString } from './TimeUtil';
import ReactionBox from './ReactionBox';

const Timeline = (query) => {
    const { user } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
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

    const toggleMenu = (id, e) => {
      e.stopPropagation();
      setActiveMenuId(id === activeMenuId ? null : id);
    };

    return (
      <>
        {activeMenuId && ( <div className='clearBackground' onClick={() => setActiveMenuId(null)}></div> )}
        {posts.map((post) => (
          <div key={post._id} className={`${styles.post} ${activeMenuId !== post._id && ( styles.hover )}`} id="post" onClick={() => navigate(`/post/${post._id}`, { state: { post } })}>
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
                <button className={`${styles.postMenuButton}`} onClick={(e) => toggleMenu(post._id, e)}><FontAwesomeIcon icon={faEllipsis} /></button>
                {activeMenuId === post._id && (
                  <div className={styles.popupMenu}>
                  {post.user._id === user._id ? (
                    <button className={styles.menuDeleteButton}><FontAwesomeIcon icon={faTrashCan} /> 削除</button>
                  ) : (
                    <button className={styles.menuReportButton} data-postid={post._id}><FontAwesomeIcon icon={faFlag} /> 通報</button>
                  )}
                </div>
                )}
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