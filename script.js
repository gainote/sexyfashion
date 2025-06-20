// DOM 元素定義
const gallery = document.getElementById("gallery");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close-btn");

let zoomed = false;
let currentDate = new Date(); // 從今天往回
let loading = false;
const loadedDates = new Set(); // 防止重複載入

// 格式化日期為 YYYY_MM_DD
function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "_");
}

// 載入特定日期 JSON
function loadImageJson(dateStr) {
  if (loadedDates.has(dateStr)) {
    console.log(`⚠️ 已載入過 ${dateStr}，跳過`);
    loadPreviousDate();
    return;
  }

  const jsonUrl = `images/${dateStr}/data.json`;

  fetch(jsonUrl)
    .then(res => {
      if (!res.ok) throw new Error("JSON 不存在");
      return res.json();
    })
    .then(data => {
      if (!data.images || data.images.length === 0) {
        loadPreviousDate();
        return;
      }

      loadedDates.add(dateStr); // 標記已載入
      renderImages(data.images);
    })
    .catch(() => {
      loadPreviousDate();
    });
}

// 建立圖片卡片
function renderImages(images) {
  const fragment = document.createDocumentFragment();

  for (const imgObj of images) {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 grid-item";

    const card = document.createElement("div");
    card.className = "card shadow-sm";

    const img = document.createElement("img");
    img.src = imgObj.thumb_path;
    img.className = "card-img-top img-fluid";
    img.loading = "lazy";

    img.addEventListener("click", () => {
      modalImage.src = imgObj.filename;
      modalImage.style.transform = "scale(1)";
      imageModal.classList.add("show");
      zoomed = false;
    });

    // 可選：加入 prompt 在卡片底部（可註解）
    const cardBody = document.createElement("div");
    cardBody.className = "card-body p-2";
    const prompt = document.createElement("p");
    prompt.className = "card-text small text-muted";
    prompt.textContent = imgObj.prompt || "";
    cardBody.appendChild(prompt);

    card.appendChild(img);
    card.appendChild(cardBody);
    col.appendChild(card);
    fragment.appendChild(col);
  }

  gallery.appendChild(fragment);

  imagesLoaded(gallery, () => {
    if (!window.masonryInstance) {
      window.masonryInstance = new Masonry(gallery, {
        itemSelector: ".grid-item",
        percentPosition: true
      });
    } else {
      window.masonryInstance.appended(fragment.children);
      window.masonryInstance.layout();
    }
  });

  loading = false;
}

// 前一天
function loadPreviousDate() {
  currentDate.setDate(currentDate.getDate() - 1);
  loadNextBatch();
}

// 觸發下一批載入
function loadNextBatch() {
  if (loading) return;
  loading = true;

  const dateStr = formatDate(currentDate);
  console.log(`📦 載入日期：${dateStr}`);
  loadImageJson(dateStr);
}

// 初始載入
loadNextBatch();

// 滾動觸底自動載入
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadNextBatch();
  }
});

// Modal 控制
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    imageModal.classList.remove("show");
  });
}
if (modalImage) {
  modalImage.addEventListener("click", () => {
    zoomed = !zoomed;
    modalImage.style.transform = zoomed ? "scale(1.5)" : "scale(1)";
  });
}
