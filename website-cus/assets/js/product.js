let currentProduct = null;

function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function loadProductDetail() {
  const productId = getProductIdFromURL();
  if (!productId) {
    alert('Product ID tidak ditemukan');
    window.location.href = 'index.html';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/products/${productId}`);
    if (!res.ok) {
      throw new Error('Product not found');
    }
    currentProduct = await res.json();

    renderProduct(currentProduct);

  } catch (error) {
    console.warn('API tidak tersedia, pakai dummy:', error);

    const dummyProducts = [
      {
        id: 1,
        name: "Kaos Basic Hitam",
        price: 50000,
        category: "clothes",
        image: "https://images.pexels.com/photos/10026464/pexels-photo-10026464.jpeg",
        description: "Kaos basic berkualitas tinggi."
      },
      {
        id: 2,
        name: "Hoodie Cream Oversize",
        price: 130000,
        category: "clothes",
        image: "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg",
        description: "Hoodie trendy dan nyaman."
      },
      {
        id: 3,
        name: "Sneakers White Casual",
        price: 200000,
        category: "shoes",
        image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
        description: "Sneakers putih klasik."
      }
    ];

    currentProduct = dummyProducts.find(p => p.id == productId);

    if (currentProduct) {
      renderProduct(currentProduct);
    } else {
      alert('Produk tidak ditemukan');
      window.location.href = 'index.html';
    }
  }
}

function renderProduct(product) {
  document.getElementById('product-img').src = product.image;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent =
    `Rp ${product.price.toLocaleString('id-ID')}`;
  document.getElementById('product-description').textContent =
    product.description || 'Produk berkualitas tinggi.';

  const thumbnailsContainer = document.querySelector('.product-thumbnails');
  thumbnailsContainer.innerHTML = `
    <img src="${product.image}" class="thumbnail" onclick="changeMainImage('${product.image}')">
    <img src="${product.image}" class="thumbnail" onclick="changeMainImage('${product.image}')">
    <img src="${product.image}" class="thumbnail" onclick="changeMainImage('${product.image}')">
  `;
}

function changeMainImage(src) {
  document.getElementById('product-img').src = src;
}

function changeQuantity(delta) {
  const qtyInput = document.getElementById('qty');
  const newQty = parseInt(qtyInput.value) + delta;
  if (newQty >= 1) {
    qtyInput.value = newQty;
  }
}

function updateQuantity() {
  const qtyInput = document.getElementById('qty');
  const qty = parseInt(qtyInput.value);
  if (qty < 1 || isNaN(qty)) {
    qtyInput.value = 1;
  }
}

function addToCartDetail() {
  if (!currentProduct) return;

  const qty = parseInt(document.getElementById('qty').value);

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existing = cart.find(item => item.name === currentProduct.name);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      name: currentProduct.name,
      price: currentProduct.price,
      qty: qty
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  alert(`✅ ${currentProduct.name} (${qty} pcs) masuk keranjang!`);
}

// INIT
loadProductDetail();p