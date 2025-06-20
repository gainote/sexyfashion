const gallery = document.getElementById("gallery");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close-btn");

let zoomed = false;
let currentDate = new Date();
let loading = false;
const loadedDates = new Set();

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "_");
}

function loadImageJson(dateStr) {
  if (loadedDates.has(dateStr)) {
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

      loadedDates.add(dateStr);
      renderImages(data.images, () => {
        loadPreviousDate(); // 自動載下一天
      });
    })
    .catch(() => {
      loadPreviousDate();
    });
}

function renderImages(images, callback) {
  const fragment = document.createDocumentFragment();

  for (const imgObj of images) {
    const item = document.createElement("div");
    item.className = "grid-item";

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
    item.appendChild(card);
    fragment.appendChild(item);
  }

  gallery.appendChild(fragment);

  imagesLoaded(gallery, () => {
    if (!window.masonryInstance) {
      window.masonryInstance = new Masonry(gallery, {
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        gutter: 16,
        percentPosition: true
      });
    } else {
      window.masonryInstance.appended(fragment.children);
      window.masonryInstance.layout();
    }

    loading = false;
    if (typeof callback === "function") callback();
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
  loadImageJson(dateStr);
}

// 初始載入
loadNextBatch();

// 自動載入（滑到底）
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadNextBatch();
  }
});

// Modal 控制
closeBtn.addEventListener("click", () => {
  imageModal.classList.remove("show");
});
modalImage.addEventListener("click", () => {
  zoomed = !zoomed;
  modalImage.style.transform = zoomed ? "scale(1.5)" : "scale(1)";
});
