const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    const showPostFormButton = document.getElementById('show-post-form');
    const backgroundPostForm = document.querySelector('.background-post-form');
    const postForm = document.querySelector('.post-form');
    const closePostFormButton = document.getElementById('close-post-form');
    const postLikeButtons = document.querySelectorAll('.post-like');
    const postBookmarkButtons = document.querySelectorAll('.post-bookmark');
    const postDeleteButtons = document.querySelectorAll('.menu-delete-button');
    const postMenuButtons = document.querySelectorAll('.post-menu-button');
    const popupMenus = document.querySelectorAll('.popup-menu');
    const menuIconButton = document.querySelector('.menu-icon-container');
    const userMenu = document.querySelector('.user-menu');
    const userMenuLogoutButton = document.getElementById('user-logout-button');

    socket.on('connected', (data) => {
        fetch('/', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    });

    socket.on('notification', () => {
        updateNotificationBadge();
    });

    showPostFormButton.addEventListener('click', () => {
        backgroundPostForm.style.display = 'block';
        postForm.style.display = 'block';
    });

    closePostFormButton.addEventListener('click', () => {
        backgroundPostForm.style.display = 'none';
        postForm.style.display = 'none';
    });

    //投稿のいいねボタン
    postLikeButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const postId = button.getAttribute('data-postid');
            sendLike(postId, button);
            event.stopPropagation();
        });
    });

    //投稿のブックマークボタン
    postBookmarkButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const postId = button.getAttribute('data-postid');
            sendBookmark(postId, button);
            event.stopPropagation();
        });
    });

    //投稿の削除ボタン
    postDeleteButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const postId = button.getAttribute('data-postid');
            deletePost(postId);
            event.stopPropagation();
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.classList.contains('post-menu-button')) {
            userMenu.style.display = 'none';
            popupMenus.forEach((menu) => {
                menu.style.display = 'none';
                event.stopPropagation();
            });

        }
    });

    //ポストメニュー表示ボタン
    postMenuButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            popupMenus.forEach((menu) => {
                menu.style.display = 'none';
            });
            // クリックされたメニューボタンに対応するポップアップメニューを表示
            popupMenus[index].style.display = 'block';
            event.stopPropagation();
        });
    });

    menuIconButton.addEventListener('click', (event) => {
        userMenu.style.display = 'block';
        event.stopPropagation();
    });

    userMenuLogoutButton.addEventListener('click', (event) => {
        redirectToURL('/logout');
        event.stopPropagation();
    });

    function sendLike(postId, button) {
        const data = { postId: postId };
        fetch('/like', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.status === 200){
                if (button.classList.contains("fa-regular")) {
                    button.classList.remove("fa-regular");
                    button.classList.add("fa-solid");
                } else if (button.classList.contains("fa-solid")) {
                    button.classList.remove("fa-solid");
                    button.classList.add("fa-regular");
                }
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    function sendBookmark(postId, button) {
        const data = { postId: postId };
        fetch('/bookmarks', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.status === 200){
                if (button.classList.contains("fa-regular")) {
                    button.classList.remove("fa-regular");
                    button.classList.add("fa-solid");
                } else if (button.classList.contains("fa-solid")) {
                    button.classList.remove("fa-solid");
                    button.classList.add("fa-regular");
                }
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    function deletePost(postId) {
        const data = { postId: postId };
        fetch('/post/delete', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.status === 200){
                window.location.reload();
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    function updateNotificationBadge() {
        fetch('/api/notifications/unread-count') // 未読通知数を取得するエンドポイントを使用
          .then(response => response.json())
          .then(data => {
            const badge = document.querySelector('.notifications-count-badge');
            const text = document.querySelector('.notifications-count-number');
            if (data.unreadCount > 0) {
              text.textContent = data.unreadCount;
              badge.style.display = 'inline-block';
            } else {
              badge.style.display = 'none';
            }
          })
          .catch(error => console.error('Error fetching unread count:', error));
    }

    updateNotificationBadge();
});

function redirectToURL(url) {
    window.location.href = url; // 現在のウィンドウを指定したURLに遷移
}