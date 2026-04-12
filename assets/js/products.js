console.log("JS KELOAD 🔥");

// ================= LOAD DATA =================
function loadProducts() {
    fetch('http://localhost:8080/ecommerce-dashboard/backend/get_products.php')
    .then(res => res.json())
    .then(data => {
        let table = document.getElementById('productTable');
        table.innerHTML = "";

        data.forEach(item => {
            table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.brand}</td>
                <td>${item.category}</td>
                <td>${item.size}</td>
                <td>${item.color}</td>
                <td>${item.stock}</td>
                <td>
                    <button onclick="requestRestock(${item.product_id}, ${item.variant_id})">Restock</button>
                    <button onclick="editProduk(${item.variant_id}, ${item.stock})">Edit</button>
                    <button onclick="deleteProduk(${item.variant_id})">Delete</button>
                </td>
            </tr>
            `;
        });
    });
}

// ================= TAMBAH PRODUK =================
function tambahProduk() {
    let name = document.getElementById('name').value;
    let brand = document.getElementById('brand').value;
    let category = document.getElementById('category').value;
    let price = document.getElementById('price').value;

    if(!name || !brand || !category || !price){
        alert("Isi semua field!");
        return;
    }

    fetch('http://localhost:8080/ecommerce-dashboard/backend/add_product.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `name=${name}&brand=${brand}&category=${category}&price=${price}`
    })
    .then(res => res.text())
    .then(data => {
        if(data.includes("berhasil")){
            alert("Produk berhasil ditambah 🔥");
            document.getElementById('name').value = "";
            document.getElementById('brand').value = "";
            document.getElementById('category').value = "";
            document.getElementById('price').value = "";
            loadProducts();
        } else {
            alert("ERROR: " + data);
        }
    });
}

// ================= TAMBAH VARIANT =================
function tambahVariant() {
    let product_id = document.getElementById('product_id').value;
    let size = document.getElementById('size').value;
    let color = document.getElementById('color').value;
    let stock = document.getElementById('stock').value;

    if(!product_id || !stock){
    alert("Product ID & Stock wajib!");
    return;

    }

    fetch('http://localhost:8080/ecommerce-dashboard/backend/add_variant.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `product_id=${product_id}&size=${size}&color=${color}&stock=${stock}`
    })
    .then(res => res.text())
    .then(data => {
        if(data.includes("berhasil")){
            alert("Variant berhasil ditambah 🔥");
            document.getElementById('product_id').value = "";
            document.getElementById('size').value = "";
            document.getElementById('color').value = "";
            document.getElementById('stock').value = "";
            loadProducts();
        } else {
            alert("ERROR: " + data);
        }
    });
}

// ================= DELETE =================
function deleteProduk(id) {
    if(!confirm("Yakin hapus?")) return;

    fetch(`http://localhost:8080/ecommerce-dashboard/backend/delete_product.php?id=${id}`)
    .then(() => loadProducts());
}

// ================= EDIT =================
function editProduk(id, stock) {
    let newStock = prompt("Update stock:", stock);
    if(!newStock) return;

    fetch('http://localhost:8080/ecommerce-dashboard/backend/update_product.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${id}&stock=${newStock}`
    })
    .then(() => loadProducts());
}

// ================= RESTOCK =================
function requestRestock(product_id, variant_id) {
    let qty = prompt("Jumlah restock:");
    if(!qty) return;

    fetch('http://localhost:8080/ecommerce-dashboard/backend/request_restock.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `product_id=${product_id}&variant_id=${variant_id}&qty=${qty}`
    })
    .then(() => alert("Request dikirim 🔥"));
}

// ================= INIT =================
loadProducts();