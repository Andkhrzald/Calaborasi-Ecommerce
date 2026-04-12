fetch('http://localhost:8080/ecommerce-dashboard/backend/get_restock.php')
.then(res => res.json())
.then(data => {
    let table = document.getElementById('restockTable');
    table.innerHTML = "";

    data.forEach(item => {

        let action = "";

        if(item.status === 'pending'){
            action = `<button onclick="approveRestock(${item.id})">Approve</button>`;
        } 
        else if(item.status === 'approved'){
            action = `<span style="color:green;">Approved</span>`;
        } 
        else {
            action = `<span>-</span>`;
        }

        table.innerHTML += `
        <tr>
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${item.color}</td>
            <td>${item.qty}</td>
            <td>${item.status}</td>
            <td>${action}</td>
        </tr>
        `;
    });
});

function approveRestock(id){
    fetch('http://localhost:8080/ecommerce-dashboard/backend/approve_restock.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${id}`
    })
    .then(() => {
        alert("Restock approved 🔥");
        location.reload();
    });
}