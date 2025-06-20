// DOM 元素定義
const gallery = document.getElementById("gallery");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close-btn");

let zoomed = false;
let currentDate = new Date(); // 從今天往回
let loading = false;
const loadedDates = new Set(); // 防止重複載入

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "_");
}

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

      loadedDates.add(dateStr); // ✅ 標記為已載入
      renderImages(data.images, () => {
        loadPreviousDate(); // ✅ 載完就自動載下一天
      });
    })
    .catch(() => {
      loadPreviousDate(); // JSON 不存在 → 自動跳前一天
    });
}

function renderImages(images, callback) {
  const fragment = document.createDocumentFragment();

  for (const imgObj of images) {
    const col = document.createElement("div");
    // col.className = "col-sm-6 col-md-4 col-lg-3 grid-item";
    // 改成純 Masonry 用的：
    col.className = "grid-item";
    
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

    card.appendChild(img);
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

    loading = false;
    if (typeof callback === "function") {
      callback(); // ✅ 載完圖片後載下一天
    }
  });
}

function loadPreviousDate() {
  currentDate.setDate(currentDate.getDate() - 1);
  loadNextBatch();
}

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
