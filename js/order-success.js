async function loadOrder() {
    const orderNo = getQueryParam("orderNo");

    document.getElementById("orderNoText").innerText = `訂單編號：${orderNo}`;

    const resp = await fetch(`/api/orders/find/orderNo/${orderNo}`);

    if (!resp.ok) {
        document.getElementById("orderDetail").innerHTML =
            "<p class='text-danger'>⚠ 無法取得訂單資訊</p>";
        return;
    }

    const order = await resp.json();

    document.getElementById("orderDetail").innerHTML = `
        <p><strong>姓名：</strong>${order.name}</p>
        <p><strong>電話：</strong>${order.phone}</p>
        <p><strong>車型：</strong>${order.adscar?.name || "-"}</p>
        <p><strong>金額：</strong>NT$ ${order.totalPrice}</p>
        <p><strong>出發地：</strong>${order.pickupPlace}</p>
        <p><strong>目的地：</strong>${order.dropoffPlace}</p>
        <p><strong>時間：</strong>${order.pickupDate} ${order.pickupTime}</p>
    `;
}

loadOrder();