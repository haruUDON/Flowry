document.addEventListener('DOMContentLoaded', () => {
    let replyTextArea = document.getElementById('reply-textarea');
    let clientHeight = replyTextArea.clientHeight;
    const replySubmitButton = document.getElementById('reply-button');

    replyTextArea.addEventListener('input', () => {
        const textAreaContent = replyTextArea.value;
        if (textAreaContent.trim() !== '') {
            replySubmitButton.disabled = false;
        } else {
            replySubmitButton.disabled = true;
        }
        replyTextArea.style.height = clientHeight + 'px';
        let scrollHeight = replyTextArea.scrollHeight;
        replyTextArea.style.height = scrollHeight + 'px';
    });
});