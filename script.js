const gallery = document.getElementById("gallery");
let loaded = 0;

// Modal 功能
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close-btn");
let zoomed = false;

function loadImages(batch = 10) {
  for (let i = 0; i < batch; i++) {
    const imgId = 100 + loaded + i;
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 grid-item";

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = `https://picsum.photos/id/${imgId}/400/600`;
    img.className = "card-img-top";

    img.addEventListener("click", () => {
      modalImage.src = img.src.replace('/400/600', '/800/1200');
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
