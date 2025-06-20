const gallery = document.getElementById("gallery");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close-btn");
let zoomed = false;

let currentDate = new Date(); // 今天
let loading = false;
let imgIndex = 1; // 從第 1 張圖開始

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "_"); // 2025_06_20
}

function getImagePaths(dateStr, index) {
  const padded = String(index).padStart(2, "0");
  const folder = `images/${dateStr}`;
  return {
    thumb: `${folder}/${dateStr}_${padded}_thumb.webp`,
    full: `${folder}/${dateStr}_${padded}.webp`
  };
}

function tryLoadNextImage(batch = 10) {
  if (loading) return;
  loading = true;

  let loadedThisBatch = 0;

  function loadOne() {
    if (loadedThisBatch >= batch) {
      loading = false;
      return;
    }

    const dateStr = formatDate(currentDate);
    const { thumb, full } = getImagePaths(dateStr, imgIndex);

    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 grid-item";

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = thumb;
    img.className = "card-img-top";
    img.loading = "lazy";

    let failCount = 0;

    img.onload = () => {
      img.addEventListener("click", () => {
        modalImage.src = full;
        modalImage.style.transform = "scale(1)";
        imageModal.classList.add("show");
        zoomed = false;
      });

      card.appendChild(img);
      col.appendChild(card);
      gallery.appendChild(col);

      imagesLoaded(gallery, () => {
        new Masonry(gallery, {
          itemSelector: ".grid-item",
          percentPosition: true
        });
      });

      imgIndex++;
      loadedThisBatch++;
      loadOne(); // load next
    };

    img.onerror = () => {
      // 如果這天已無更多圖片，切到前一天
      failCount++;
      if (failCount > 3) {
        // 前一天
        currentDate.setDate(currentDate.getDate() - 1);
        imgIndex = 1;
      } else {
        imgIndex++;
      }
      loadOne(); // 繼續試
    };

    // 預載觸發
    img.style.display = "none";
    document.body.appendChild(img); // 觸發 preload（看不到）
  }

  loadOne();
}

// Modal 控制
closeBtn.addEventListener("click", () => {
  imageModal.classList.remove("show");
});
modalImage.addEventListener("click", () => {
  zoomed = !zoomed;
  modalImage.style.transform = zoomed ? "scale(1.5)" : "scale(1)";
});

// Scroll lazy loading
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    tryLoadNextImage(6);
  }
});

// Init
tryLoadNextImage(10);
