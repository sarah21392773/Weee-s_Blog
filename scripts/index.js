let currentTag = 'all';
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const topBtn = document.getElementById('topBtn');
let articles = [];

// 搜尋按鈕動畫
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
        loadPosts();
    }
});

// 回到頂部按鈕
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

// 標籤
function loadTags() {
    const tagSet = new Set();
    articles.forEach(a => {
        (a.tags || '').split(',').forEach(t => {
            if(t.trim()) tagSet.add(t.trim());
        });
    });

    const tagContainer = document.getElementById('tagContainer');
    tagContainer.innerHTML = '';
    const allSpan = document.createElement('span');
    allSpan.textContent = '全部';
    allSpan.classList.add('active');
    allSpan.onclick = () => setTag('all');
    tagContainer.appendChild(allSpan);

    tagSet.forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag;
        span.onclick = () => setTag(tag);
        tagContainer.appendChild(span);
    });
}

function setTag(tag){
    currentTag = tag;
    document.querySelectorAll('#tagContainer span').forEach(s => s.classList.remove('active'));
    const spans = Array.from(document.querySelectorAll('#tagContainer span'));
    const activeSpan = spans.find(s => s.textContent === (tag === 'all' ? '全部' : tag));
    if(activeSpan) activeSpan.classList.add('active');
    loadPosts();
}

// 文章
function loadPosts() {
    const postsContainer = document.querySelector('.posts');
    const keyword = searchInput.value.trim().toLowerCase();
    const sortedArticles = [...articles].sort((a,b)=>{
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });

    postsContainer.innerHTML = '';
    sortedArticles.forEach(article => {
        const tags = (article.tags || '').split(',').map(t => t.trim());
        if(currentTag !== 'all' && !tags.includes(currentTag)) return;
        if(keyword && !article.title.toLowerCase().includes(keyword) && !article.content.toLowerCase().includes(keyword)) return;

        const post = document.createElement('div');
        post.className = 'post';
        post.dataset.tags = article.tags || '未分類';
        post.onclick = () => location.href = 'article.html?id=' + article.id;

        const preview = article.content.length > 50 ? article.content.substring(0,50)+'...' : article.content;
        const displayDate = article.date ? new Date(article.date).toLocaleDateString() : '未知日期';
        post.innerHTML = `
            <h3>${article.title}</h3>
            <p>${preview}</p>
            <div class="tag-list">${tags.map(t=>`<span>${t}</span>`).join('')}</div>
            <div class="meta">${displayDate}</div>
        `;
        postsContainer.appendChild(post);
    });
    console.log("文章數量：", sortedArticles.length, sortedArticles);
}
async function loadArticles() {
    try {
        const res = await fetch('./articles.json');
        articles = await res.json();
        loadTags();
        loadPosts();
    } catch (e) {
        console.error("載入 articles.json 失敗：", e);
    }
}

searchInput.addEventListener('input', loadPosts);

window.onload = () => {
    loadArticles();
};