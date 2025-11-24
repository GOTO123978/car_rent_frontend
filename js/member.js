// ⭐ 修改：定義後端 API 基礎路徑 (指向 Spring Boot 8080)
const API_BASE_URL = "http://localhost:8080";

/* =========================================
   1. 會員登入邏輯
   ========================================= */
function loginresult() {
    // 取得使用者輸入
    const usernameVal = $("#username").val();
    const passwordVal = $("#password").val();

    if (!usernameVal || !passwordVal) {
        alert("請輸入帳號與密碼");
        return;
    }

    $.ajax({
        // ⭐ 修改：使用絕對路徑
        url: API_BASE_URL + "/login",
        type: "post",
        data: {
            username: usernameVal,
            password: passwordVal
        },
        dataType: "json",
        success: (data) => {
            // 1. 儲存 Token 與會員資料到 SessionStorage
            sessionStorage.setItem("jwtToken", data.token);
            
            // 儲存會員詳細資訊 (供 member.html 等頁面使用)
            const mem = data.member;
            sessionStorage.setItem("memberId", mem.memberId);
            sessionStorage.setItem("memberName", mem.name);
            sessionStorage.setItem("memberEmail", mem.email);
            sessionStorage.setItem("memberPhone", mem.phone);
            sessionStorage.setItem("memberAddress", mem.address);
            sessionStorage.setItem("memberIdNumber", mem.idNumber);
    sessionStorage.setItem("memberRegisterDate", mem.registerDate);
            // 如有需要可繼續存其他欄位...

            alert(mem.name + " 登入成功");

            // 2. 關閉 Modal (如果是在 Modal 中)
            // 3. ⭐ 修改：重新整理頁面，讓 index.html 的 Navbar 更新狀態
            location.reload(); 
        },
        error: (xhr) => {
            console.error(xhr);
            if (xhr.status === 401) {
                alert("帳號或密碼錯誤，請重新輸入");
            } else {
                alert("系統錯誤，無法登入");
            }
        }
    });
}

/* =========================================
   2. 登出邏輯
   ========================================= */
function handleLogout() {
    sessionStorage.clear();
    alert("已登出");
    // ⭐ 修改：回到前端首頁
    window.location.href = "index.html";
}

/* =========================================
   3. 檢查登入狀態 (驗證 Token)
   ========================================= */
function checkLoginStatusAsync() {
    return new Promise((resolve) => {
        const token = sessionStorage.getItem("jwtToken");
        if (!token) {
            resolve(false);
            return;
        }

        $.ajax({
            url: API_BASE_URL + "/validate",
            type: "POST",
            headers: { "Authorization": "Bearer " + token },
            success: function(res) {
                resolve(res.valid === true);
            },
            error: function() {
                // Token 過期或無效
                sessionStorage.clear(); 
                resolve(false);
            }
        });
    });
}

/* =========================================
   4. 頁面導向 (跳轉邏輯)
   ========================================= */

// 跳轉「我的訂單」 (後端 SSR 頁面)
async function goMyOrder() {
    const valid = await checkLoginStatusAsync();
    
    if (valid) {
        // ⭐ 修改重點：從 Storage 取得 memberId
        const memberId = sessionStorage.getItem("memberId");
        
        if(memberId) {
            // ⭐ 將 memberId 帶入 URL 參數
            window.location.href = API_BASE_URL + "/my-orders?memberId=" + memberId;
        } else {
            alert("無法讀取會員資訊，請重新登入");
            handleLogout();
        }
    } else {
        alert("請先登入會員");
        // 如果是在首頁，打開登入 Modal
        if ($("#loginModal").length) {
            var myModal = new bootstrap.Modal(document.getElementById('loginModal'));
            myModal.show();
        } else {
            location.href = "index.html";
        }
    }
}

// 跳轉「會員中心」 (前端靜態頁面 member.html)
async function goMemberCenter() {
    const valid = await checkLoginStatusAsync();
    if (valid) {
        // 相對路徑 (假設 member.html 也在 VS Code 專案中)
        window.location.href = "member.html";
    } else {
        handleLogout();
    }
}

// 跳轉「註冊頁面」
function goRegisterwindow() {
    window.location.href = "register.html";
}

/* =========================================
   5. 註冊會員邏輯 (修改版)
   ========================================= */
function addmember(e) {
    if(e) e.preventDefault(); 

    // 0. 清除之前的錯誤訊息
    $("#errorMsg").addClass("d-none").text("");

    // 1. 觸發 HTML5 表單驗證 (檢查必填、Pattern 格式)
    const form = document.getElementById("registerForm");
    if (!form.checkValidity()) {
        // 如果格式不對，瀏覽器會自動跳出提示，我們手動觸發它
        form.reportValidity(); 
        return;
    }

    // 2. 取得欄位值
    let name = $("#membername").val();
    let idnumber = $("#idnumber").val();
    let phone = $("#phone").val();
    let birthday = $("#birthday").val();
    let gender = $("input[name='gender']:checked").val();
    let email = $("#email").val();
    let address = $("#address").val();
    let registerpw = $("#registerpw").val();
    let checkpw = $("#checkpw").val();

    // 3. 檢查密碼是否一致
    if (registerpw !== checkpw) {
        showError("密碼確認不一致，請重新輸入");
        return;
    }

    let memData = {
        name: name,
        idNumber: idnumber,
        phone: phone,
        birthday: birthday,
        gender: gender,
        email: email,
        address: address,
        password: registerpw
    };

    // 4. 發送 AJAX
    $.ajax({
        url: API_BASE_URL + "/register",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(memData),
        success: (data) => {
            alert("註冊成功！請重新登入");
            location.href = "login.html"; // 註冊成功跳轉去登入頁
        },
        error: function(xhr) {
            // ⭐ 顯示後端回傳的錯誤訊息 (例如：Email已註冊)
            if (xhr.status === 409) {
                showError(xhr.responseText); // 後端傳回的純文字訊息
            } else {
                showError("註冊失敗，請稍後再試 (" + xhr.status + ")");
                console.error(xhr);
            }
        }
    });
}

// ⭐ 輔助函數：顯示錯誤訊息
function showError(message) {
    $("#errorMsg").removeClass("d-none").text(message);
    // 讓畫面捲動到錯誤訊息處
    document.getElementById("errorMsg").scrollIntoView({ behavior: "smooth", block: "center" });
}

/* =========================================
   6. 初始化 & 事件綁定 (Document Ready)
   ========================================= */
$(document).ready(function () {

    // 綁定登入按鈕 (Login Modal 中的按鈕 ID)
    $("#login").click(loginresult);

    // 綁定註冊按鈕 (Register 頁面中的按鈕 ID)
    $("#registernew").click(addmember);

    // 檢查目前登入狀態，更新 Navbar UI
    const token = sessionStorage.getItem("jwtToken");
    const memberName = sessionStorage.getItem("memberName");

    // 針對 index.html 的 Navbar 控制
    if (token && memberName) {
        // --- 已登入狀態 ---
        // 1. 顯示歡迎詞
        $("#welcome-message").text(memberName + " 您好");
        
        // 2. 按鈕變為「登出」
        $("#loginout").text("登出")
                      .removeClass("btn-outline-light") // 視您的 CSS 而定
                      .addClass("btn-outline-danger")
                      .removeAttr("data-bs-toggle") // 移除 Modal 觸發
                      .removeAttr("data-bs-target")
                      .off("click") // 移除舊事件
                      .click(function() {
                          // 登出行為
                          sessionStorage.clear();
                          alert("已成功登出");
                          location.reload();
                      });
                      
    } else {
        // --- 未登入狀態 ---
        $("#welcome-message").text(""); // 清空歡迎詞
        $("#loginout").text("會員登入");
        // 維持 HTML 原本的 data-bs-toggle="modal" 屬性，不做額外 JS 綁定，讓它開啟 Modal
    }
});