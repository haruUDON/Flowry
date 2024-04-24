import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../App';
import { useLocation, useParams } from 'react-router-dom';
import styles from "../styles/Timeline.module.css";
import Timeline from './Timeline';
import ReactionBox from './ReactionBox';
import PopupPostMenu from './PopupPostMenu';

const Post = () => {
    const { user } = useContext(UserContext);
    const [currentPost, setCurrentPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { postId } = useParams();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.post) {
            setCurrentPost(location.state.post);
            setLoading(false);
            return;
        }

        let isMounted = true;
    
        fetch('/api/post', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId }),
        }).then(
            response => response.json()
        ).then(
            data => {
              if (isMounted) {
                setCurrentPost(data.post);
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
    }, [postId, location.state, currentPost]);

    const query = {
        parent: postId
    }

    return (
        <div className='timelineContainer'>
            <div className='postsContainer'>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                    </div>
                ) : (
                    <>
                        <div className={styles.soloPost}>
                            <div className={styles.postHead}>
                                <div className={styles.postIconContainer}>
                                    <img src={`data:image/jpeg;base64, ${currentPost.user.icon}`} alt="Icon" className={styles.iconImg} />
                                </div>
                                <p className={styles.postDetail}>
                                    <span>
                                        <a href={`/profile/${currentPost.user._id}`} className={styles.displayName}>
                                            {currentPost.user.display_name.length > 20 ? currentPost.user.display_name.slice(0, 20) + '...' : currentPost.user.display_name}
                                        </a>
                                    </span>
                                    <span className={styles.timestamp}>
                                        {Math.floor((new Date() - new Date(currentPost.uploaded_at)) / (1000 * 60 * 60))}時間
                                    </span>
                                </p>
                                <PopupPostMenu post={currentPost} />
                            </div>
                            <div className={styles.postBody}>
                                <span className={styles.postContent}>{currentPost.text}</span>
                            </div>
                        </div>
                        <ReactionBox post={currentPost} current={true} />
                        <div className={styles.replyFormDiv}>
                            <div className={styles.postFlex}>
                                <div className={styles.postLeft}>
                                    <div className={styles.postIconContainer}>
                                        <img src={`data:image/jpeg;base64, ${user.icon}`} alt="Icon" className={styles.iconImg} />
                                    </div>
                                </div>
                                <div className={styles.postRight}>
                                    <form className={styles.replyForm}>
                                        <textarea id="reply-textarea" placeholder="返信を投稿..." name="text" rows="1"></textarea>
                                        <button id="reply-button" type="submit" disabled>返信</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <Timeline query={query} />
            </div>
        </div>
    )
}

export default Post
