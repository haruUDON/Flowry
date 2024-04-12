const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    const showPostFormButton = document.getElementById('show-post-form');
    const backgroundPostForm = document.querySelector('.background-post-form');
    const postForm = document.querySelector('.post-form');
    const closePostFormButton = document.getElementById('close-post-form');
    const postDives = document.querySelectorAll('.post');
    const postLikeButtons = document.querySelectorAll('.post-like');
    const postBookmarkButtons = document.querySelectorAll('.post-bookmark');
    const postReportButtons = document.querySelectorAll('.menu-report-button');
    const reportMenu = document.querySelector('.report-menu');
    const reportForm = document.getElementById('report-form');
    const reportRadioButtons = document.getElementsByName('reportReason');
    const reportSubmitButton = document.getElementById('report-submit');
    const closeReportMenuButton = document.getElementById('close-report-form');
    const postMenuButtons = document.querySelectorAll('.post-menu-button');
    const popupMenus = document.querySelectorAll('.popup-menu');
    const menuIconButton = document.querySelector('.menu-icon-container');
    const userMenu = document.querySelector('.user-menu');
    const userMenuLogoutButton = document.getElementById('user-logout-button');

    const profileMenuButton = document.querySelector('.profile-menu-button');
    const popupProfileMenu = document.querySelector('.popup-menu-profile');

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
    postDives.forEach((post) => {
        const button = post.querySelector('.menu-delete-button');
        if (button){
            button.addEventListener('click', (event) => {
                const postId = button.getAttribute('data-postid');
                deletePost(postId, post);
                event.stopPropagation();
            });
        }
    });

    //通報メニュー

    postReportButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const postId = button.getAttribute('data-postid');
            reportMenu.dataset.postid = postId;
            reportMenu.style.display = 'block';
            backgroundPostForm.style.display = 'block';
            popupMenus.forEach((menu) => {
                menu.style.display = 'none';
            });
            userMenu.style.display = 'none';
            if (profileMenuButton) popupProfileMenu.style.display = 'none';
            reportRadioButtons.forEach((radio) => {
                radio.checked = false;
            });
            reportSubmitButton.disabled = true;
            event.stopPropagation();
        });
    });

    reportRadioButtons.forEach((radio) => {
        radio.addEventListener('change', () => {
            reportSubmitButton.disabled = !radio.checked;
        });
    });

    closeReportMenuButton.addEventListener('click', () => {
        backgroundPostForm.style.display = 'none';
        reportMenu.style.display = 'none';
    });

    reportForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const formData = new FormData(reportForm);
        const postId = reportMenu.getAttribute('data-postid');
        const reportReason = formData.get('reportReason');

        const data = { reportReason, postId };
        fetch('/post/report', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.status === 200){
                backgroundPostForm.style.display = 'none';
                reportMenu.style.display = 'none';
                showPopupResult('通報を受け付けました');
            }
        })
        .catch(error => {
            console.error('Error:', error); // エラー時の処理
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.classList.contains('post-menu-button')) {
            userMenu.style.display = 'none';
            if (profileMenuButton) popupProfileMenu.style.display = 'none';
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

            if (profileMenuButton) popupProfileMenu.style.display = 'none';

            // クリックされたメニューボタンに対応するポップアップメニューを表示
            popupMenus[index].style.display = 'block';
            event.stopPropagation();
        });
    });

    if (profileMenuButton) {
        profileMenuButton.addEventListener('click', (event) => {
            popupProfileMenu.style.display = 'block';
            popupMenus.forEach((menu) => {
                menu.style.display = 'none';
            });
            event.stopPropagation();
        });
    }

    menuIconButton.addEventListener('click', (event) => {
        userMenu.style.display = 'block';
        event.stopPropagation();
    });

    userMenuLogoutButton.addEventListener('click', (event) => {
        redirectToURL('/logout');
        event.stopPropagation();
    });

    function showPopupResult(message){
        const popupResult = document.createElement('div');
        popupResult.classList.add('popup-result');
        const span = document.createElement('span');
        span.textContent = message;
        popupResult.appendChild(span);

        document.body.appendChild(popupResult);

        setTimeout(() => {
            document.body.removeChild(popupResult);
        }, 3000);
    }

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

    function deletePost(postId, postDiv) {
        const data = { postId };
        fetch('/post/delete', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.status === 200){
                const parentElement = postDiv.parentElement;
                parentElement.removeChild(postDiv);
                showPopupResult('投稿を削除しました');
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