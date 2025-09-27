let currentTags = [];
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const topBtn = document.getElementById('topBtn');
let articles = [];

// ----- 讀取 URL 標籤參數 -----
function readTagFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');
    if(tagParam){
        currentTags = [tagParam]; 
        applyFilter();              
        history.replaceState({}, '', window.location.pathname);
    }
}

// ----- 搜尋按鈕動畫 -----
searchBtn.addEventListener('click', () => {
    const isShow = searchInput.classList.toggle('show');

    searchBtn.style.animation = 'clickRotateBounce 0.6s ease forwards';
    searchBtn.addEventListener('animationend', () => {
        searchBtn.style.animation = '';
        if(!searchInput.classList.contains('show')){
            searchBtn.style.transform = 'scale(1) rotate(0deg)';
        }
    }, { once: true });

    if(isShow) searchInput.focus();
    else {
        searchInput.value = '';
        applyFilter();
    }
});

// ----- 回到頂部按鈕 -----
window.onscroll = () => {
    if(document.body.scrollTop > 200 || document.documentElement.scrollTop > 200){
        topBtn.style.display = 'block';
    } else {
        topBtn.style.display = 'none';
    }
};
topBtn.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
});

// ----- 載入標籤列 -----
function loadTags() {
    const tagSet = new Set();
    articles.forEach(a => {
        (a.tags || '').split(',').forEach(t => {
            const trimmed = t.trim();
            if(trimmed) tagSet.add(trimmed);
        });
    });

    const tagContainer = document.getElementById('tagContainer');
    tagContainer.innerHTML = '';

    // 全部按鈕
    const allSpan = document.createElement('span');
    allSpan.textContent = '全部';
    if(currentTags.length === 0) allSpan.classList.add('active');
    allSpan.addEventListener('click', () => {
        currentTags = [];
        applyFilter();
    });
    tagContainer.appendChild(allSpan);

    // 各個標籤
    tagSet.forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag;
        if(currentTags.includes(tag)) span.classList.add('active');
        span.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTag(tag);
        });
        tagContainer.appendChild(span);
    });
}

// ----- 切換標籤選取 -----
function toggleTag(tag) {
    if(currentTags.includes(tag)){
        currentTags = currentTags.filter(t => t !== tag);
    } else {
        currentTags.push(tag);
    }
    applyFilter();
}

// ----- 格式化日期 -----
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}/${m}/${day}`;
}

// ----- 篩選文章 -----
function applyFilter() {
    const postsContainer = document.querySelector('.posts');
    const keyword = searchInput.value.trim().toLowerCase();

    const filtered = articles.filter(article => {
        const tags = (article.tags || '').split(',').map(t => t.trim());
        const tagMatch = currentTags.length === 0 || currentTags.some(t => tags.includes(t));
        const keywordMatch = !keyword || article.title.toLowerCase().includes(keyword) || article.content.toLowerCase().includes(keyword);
        return tagMatch && keywordMatch;
    }).map(article => {
        let score = 0;
        if(keyword){
            const titleCount = (article.title.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
            const contentCount = (article.content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
            score += titleCount * 10 + contentCount;
        }
        const tags = (article.tags || '').split(',').map(t => t.trim());
        const tagScore = currentTags.reduce((acc,t) => acc + (tags.includes(t) ? 5 : 0), 0);
        score += tagScore;
        return {...article, score};
    });

    // 排序：分數日期
    filtered.sort((a,b) => {
        if(b.score !== a.score) return b.score - a.score;
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });

    // 更新
    postsContainer.innerHTML = '';
    filtered.forEach(article => {
        const tags = (article.tags || '').split(',').map(t => t.trim());
        const preview = article.content.length > 50 ? article.content.substring(0,50) + '...' : article.content;
        const displayDate = article.date ? formatDate(article.date) : '未知日期';

        const post = document.createElement('div');
        post.className = 'post';
        post.dataset.tags = article.tags || '未分類';
        post.onclick = () => location.href = 'article.html?id=' + article.id;
        post.innerHTML = `
            <h3>${article.title}</h3>
            <p>${preview}</p>
            <div class="tag-list">${tags.map(t=>`<span>${t}</span>`).join('')}</div>
            <div class="meta">${displayDate}</div>
        `;
        postsContainer.appendChild(post);
    });

    // 更新標籤
    document.querySelectorAll('#tagContainer span').forEach(s => {
        const text = s.textContent;
        if(text === '全部' && currentTags.length === 0){
            s.classList.add('active');
        } else if(currentTags.includes(text)){
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}


// ----- 載入文章 -----
async function loadArticles() {
    try {
        const res = await fetch('./articles.json');
        articles = await res.json();
        loadTags();
        applyFilter();
    } catch (e) {
        console.error("載入 articles.json 失敗：", e);
    }
}

// ----- 監聽搜尋輸入 -----
searchInput.addEventListener('input', applyFilter);

// ----- 初始化 -----
window.onload = () => {
    readTagFromURL(); // 先讀 URL 標籤
    loadArticles();
};
