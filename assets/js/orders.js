fetch('http://localhost:8080/ecommerce-dashboard/backend/get_orders.php')
.then(res => res.json())
.then(data => {
    let table = document.getElementById('orderTable');
    table.innerHTML = "";

    data.forEach(item => {

        let disabled = (item.status === 'done' || item.status === 'cancel') ? 'disabled' : '';

        let actions = "";

        if(item.status === 'pending'){
            actions = `<button onclick="updateStatus(${item.id}, 'process')">Process</button>`;
        }

        if(item.status === 'process'){
            actions = `<button onclick="updateStatus(${item.id}, 'shipped')">Ship</button>`;
        }

        if(item.status === 'shipped'){
            actions = `<button onclick="updateStatus(${item.id}, 'done')">Done</button>`;
        }   

        if(item.status === 'done'){
            actions = `<span>✔ Selesai</span>`;
        }

        if(item.status === 'cancel'){
            actions = `<span>❌ Cancel</span>`;
        }

        table.innerHTML += `
        <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.size ?? '-'}</td>
            <td>${item.color ?? '-'}</td>
            <td>${item.customer_name}</td>
            <td>${item.quantity}</td>
            <td>${item.status}</td>
            <td>${actions}</td>
        </tr>
        `;
    });
});

function updateStatus(id, status) {
    fetch(`http://localhost:8080/ecommerce-dashboard/backend/update_order.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${id}&status=${status}`
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        location.reload();
    });
}