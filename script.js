const gallery = document.getElementById("gallery");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close-btn");

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
      renderImages(data.images);
      loadPreviousDate();
    })
    .catch(() => {
      loadPreviousDate();
    });
}

function renderImages(images) {
  const fragment = document.createDocumentFragment();

  images.forEach(imgObj => {
    const item = document.createElement("div");
    item.className = "grid-item";

    const card = document.createElement("div");
    card.className = "card shadow-sm";

    const img = document.createElement("img");
    img.src = imgObj.thumb_path;
    img.className = "card-img-top img-fluid";
    img.loading = "lazy";
    img.alt = imgObj.alt || "藝術攝影";

    img.addEventListener("click", () => {
      modalImage.src = imgObj.filename;
      modalImage.style.transform = "scale(1)";
      imageModal.classList.add("show");
    });

    card.appendChild(img);
    item.appendChild(card);
    fragment.appendChild(item);
  });

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

// 初始化
loadNextBatch();

// 滾動到底載入
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadNextBatch();
  }
});

// Modal
closeBtn.addEventListener("click", () => {
  imageModal.classList.remove("show");
});
modalImage.addEventListener("click", () => {
  const zoomed = modalImage.style.transform === "scale(1.5)";
  modalImage.style.transform = zoomed ? "scale(1)" : "scale(1.5)";
});