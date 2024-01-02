document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            search(); // fetch関数を呼び出す
        }
    });

    function search(){
        const searchValue = searchInput.value;
        if (!searchValue) return;
        window.location.href = `/search/?q=${searchValue}`;
    }
});