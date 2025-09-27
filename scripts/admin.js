/* 文章功能 */
let articles = []; // 存放所有文章

// 先載入既有的 JSON
async function loadArticles() {
  try {
    const res = await fetch('./articles.json');
    if (!res.ok) throw new Error("讀取失敗");
    articles = await res.json();
  } catch (err) {
    console.warn("載入舊文章失敗，使用空陣列:", err);
    articles = [];
  }
}
loadArticles()

function addArticle(){
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  const tags = getSelectedTags().join(',');
  if(!title || !content){ 
    alert("標題和內容不能為空"); 
    return; 
  }

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const dateStr = `${yyyy}-${mm}-${dd}`;  
  const id = articles.length > 0 ? Math.max(...articles.map(a => a.id || 0)) + 1 : 1;

  articles.push({id, title, content, tags, date: dateStr});

  // 下載更新後的主 JSON
  const blob = new Blob([JSON.stringify(articles, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'articles.json';
  a.click();
  URL.revokeObjectURL(url);

  alert("文章已新增並更新 articles.json，請上傳到 GitHub！");
 
  // 清空表單
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('tagsCustom').value = '';
  document.getElementById('selectedTags').innerHTML = '';
  document.getElementById('preview').innerHTML = '';
}

/* 標籤與搜尋功能 */
document.getElementById('content').addEventListener('input',()=>{
    const content=document.getElementById('content').value;
    const preview=document.getElementById('preview');
    preview.innerHTML = marked.parse(content);
    preview.querySelectorAll('pre code').forEach(block=>hljs.highlightElement(block));
});

function removeTag(tag){
  const checkbox = document.querySelector(`#tagOptions input[value="${tag}"]`);
  if(checkbox) checkbox.checked=false;
  const customInput = document.getElementById('tagsCustom');
  customInput.value = customInput.value.split(',').map(t=>t.trim()).filter(t=>t && t!==tag).join(',');
  updateSelectedTags();
}

function updateSelectedTags(){
  const selectedTagsDiv = document.getElementById('selectedTags');
  const checkboxes = Array.from(document.querySelectorAll('#tagOptions input[type=checkbox]:checked')).map(cb=>cb.value);
  const customTags = document.getElementById('tagsCustom').value.split(',').map(t=>t.trim()).filter(t=>t);
  const merged = Array.from(new Set([...checkboxes, ...customTags]));

  selectedTagsDiv.innerHTML='';
  merged.forEach(tag=>{
    const chip = document.createElement('div');
    chip.className='tag-chip';
    chip.innerHTML=`${tag} <span onclick="removeTag('${tag}')">&times;</span>`;
    selectedTagsDiv.appendChild(chip);
  });
}

function getSelectedTags(){
  const chips = document.querySelectorAll('#selectedTags .tag-chip');
  return Array.from(chips).map(c=>c.textContent.slice(0,-1));
}
