const gallery = document.getElementById("gallery");
let loaded = 0;

// 資料夾與檔案前綴
const folderName = "2025_06_19";
const filePrefix = "2025_06_19";
const maxImages = 50;

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close-btn");
let zoomed = false;

function padNumber(n) {
  return n.toString().padStart(2, '0');
}

function loadImages(batch = 10) {
  for (let i = 0; i < batch; i++) {
    const imgIndex = loaded + i + 1;
    if (imgIndex > maxImages) return;

    const padded = padNumber(imgIndex);
    const imgSrc = `images/${folderName}/${filePrefix}_${padded}_thumb.webp`;

    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 grid-item";

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = imgSrc;
    img.className = "card-img-top";

    // 錯誤處理：圖片不存在就不顯示
    img.onerror = function () {
      col.remove();
    };

    // 點擊顯示 modal
    img.addEventListener("click", () => {
      modalImage.src = img.src;
      modalImage.style.transform = 'scale(1)';
      imageModal.classList.add("show");
      zoomed = false;
    });

    card.appendChild(img);
    col.appendChild(card);
    gallery.appendChild(col);
  }

  loaded += batch;
  new Masonry(gallery, { itemSelector: '.grid-item', percentPosition: true });
}

// Modal 行為
closeBtn.addEventListener("click", () => {
  imageModal.classList.remove("show");
});
modalImage.addEventListener("click", () => {
  zoomed = !zoomed;
  modalImage.style.transform = zoomed ? 'scale(1.5)' : 'scale(1)';
});

// Infinite scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadImages(6);
  }
});

// 初始載入
loadImages(10);
