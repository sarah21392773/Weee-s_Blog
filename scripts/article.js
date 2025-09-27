// ----- 文章內容 -----
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');
let article = null;

function formatDate(dateStr) {
    if (!dateStr) return '未知日期';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
}

async function loadArticle() {
    try {
        const res = await fetch('./articles.json');
        const articles = await res.json();
        article = articles.find(a => a.id == articleId);
        if(!article) {
            article = {
                title:'找不到文章',
                content:'抱歉，這篇文章不存在。',
                id:0
            };
        }
        renderArticle();
    } catch (e) {
        console.error("載入文章失敗：", e);
    }
}

function renderArticle(){
    // 動態設定頁面標題
    document.title = article.title;
    document.getElementById('articleTitle').textContent = article.title;

    const contentDiv = document.getElementById('article-content');
    contentDiv.innerHTML = marked.parse(article.content);
    contentDiv.querySelectorAll('pre code').forEach(block=>hljs.highlightElement(block));

    // 標籤
    const tagContainer = document.getElementById('articleTags');
    tagContainer.innerHTML = '';
    (article.tags || '').split(',').forEach(tag => {
        const a = document.createElement('a');
        a.textContent = tag.trim();
        a.href = `index.html?tag=${encodeURIComponent(tag.trim())}`;
        a.className = 'tag-link';
        tagContainer.appendChild(a);
    });

    // 日期
    const dateContainer = document.getElementById('articleDate');
    if(dateContainer){
        dateContainer.textContent = formatDate(article.date);
    }

    loadComments();
}

// ----- 留言功能 -----
const commentKey = 'comments_' + articleId;
function getRandomBlue(){
    const blues = ['#4a90e2','#357ab8','#5dade2','#1f618d','#2980b9','#5499c7','#2471a3'];
    return blues[Math.floor(Math.random() * blues.length)];
}
function loadComments(){
    const comments = JSON.parse(localStorage.getItem(commentKey)) || [];
    const container = document.getElementById('commentList');
    container.innerHTML = '';
    comments.forEach((c,i)=>{
        const div = document.createElement('div');
        div.className='comment';
        const avatarLetter = c.name.trim()[0]?.toUpperCase() || 'U';
        const avatarColor = getRandomBlue();
        div.innerHTML = `
            <div class="avatar" style="background:${avatarColor}">${avatarLetter}</div>
            <div class="content">
                <p class="author">${c.name}</p>
                <p class="text">${marked.parseInline(c.text)}</p>
                <div class="meta">
                    <span class="time">${c.time || '剛剛'}</span>
                    <span class="actions" onclick="deleteComment(${i})">刪除</span>
                    <span class="actions">👍 0　💬 回覆</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}
function addComment(){
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();
    if(!name || !text){ alert('請填寫名字和留言'); return; }
    const comments = JSON.parse(localStorage.getItem(commentKey)) || [];
    comments.push({name,text,time:new Date().toLocaleString()});
    localStorage.setItem(commentKey, JSON.stringify(comments));
    document.getElementById('commentName').value='';
    document.getElementById('commentText').value='';
    loadComments();
}
function deleteComment(index){
    const comments = JSON.parse(localStorage.getItem(commentKey)) || [];
    comments.splice(index,1);
    localStorage.setItem(commentKey, JSON.stringify(comments));
    loadComments();
}

// ----- 留言區收合 -----
const toggleBtn = document.getElementById('toggleCommentsBtn');
const commentSection = document.getElementById('commentSection');
toggleBtn.addEventListener('click',()=>{
    commentSection.classList.toggle('collapsed');
    const commentList = commentSection.querySelector('.comment-list');
    const form = commentSection.querySelector('.comment-form');
    if(commentSection.classList.contains('collapsed')){
        commentList.style.display='none';
        form.style.display='none';
    }else{
        commentList.style.display='flex';
        form.style.display='flex';
    }
});

// ----- 回到頂部按鈕 -----
const topBtn = document.getElementById('topBtn');
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

// 初始化
loadArticle();