/**
 * 天下茶屋 (Tenka Tea House) - 核心連動腳本
 * 開發者：A111222017 蘇聖凱
 * 功能：環境感測、規則校驗、智慧推薦、自動結帳
 */

const state = {
    selectedItem: null,
    selectedTopping: null,
    temp: 25,
    city: "台北市",
    lastSubtotal: 0
};

// 啟動流程 - 自動感測位置與氣溫
async function initSystem() {
    const weatherUI = document.getElementById('ui-weather');
    const recommendUI = document.getElementById('ui-recommned');

    if (weatherUI) weatherUI.innerHTML = `📡 正在透過環境感測器讀取數據...`;

    try {
        // --- 方案 A：嘗試呼叫 Antigravity 本地 SDK ---
        if (window.antigravity) {
            const response = await window.antigravity.callSkill('get_weather_skill', {
                city: "egypt" 
            });
            if (response && response.data) {
                state.temp = response.data.current_temp;
                state.city = response.data.city || "egypt";
            }
        } else {
            throw new Error("SDK_NOT_FOUND");
        }
    } catch (e) {
        console.warn("使用即時環境感測 API 備援");
       try {
    state.city = "egypt"; 

    const weatherRes = await fetch(`https://wttr.in/${state.city}?format=j1`);
    const weatherData = await weatherRes.json();
    state.temp = parseInt(weatherData.current_condition[0].temp_C);
        } catch (apiError) {
            state.city = "egypt";
            state.temp = 34;
        }
    }

    updateUI(weatherUI, recommendUI);
    setupEventListeners();
}

// 根據感測結果更新 UI (對應 weather_recommendation.md 規則)
function updateUI(weatherUI, recommendUI) {
    if (!weatherUI || !recommendUI) return;

    // 顯示位置與氣溫
    weatherUI.innerHTML = `📍 ${state.city} | 🌡️ ${state.temp}°C`;

    // 實作 weather_recommendation.md 邏輯
    if (state.temp > 28) {
        recommendUI.innerText = "✨ 高溫感測：建議來杯【特調奶茶 (冰)】消暑！";
    } else if (state.temp < 15) {
        recommendUI.innerText = "❄️ 低溫特報：暖心推薦【天下紅茶 (熱)】。";
    } else {
        recommendUI.innerText = "🍃 氣候舒適：推薦經典【天下綠茶】或 【天下紅茶 】。";
    }
}

// 介面互動
function setupEventListeners() {
    // 1. 茶飲選擇
    document.querySelectorAll('.menu-item').forEach(item => {
        item.onclick = function() {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            state.selectedItem = {
                name: this.querySelector('.item-name').innerText,
                price: parseInt(this.querySelector('.item-price').innerText.replace('$', ''))
            };
        };
    });

    // 2. 加料選擇
    document.querySelectorAll('.topping-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.topping-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            state.selectedTopping = this.innerText.includes('珍珠') ? '珍珠' : '椰果';
        };
    });

    document.querySelector('.add-cart-btn').onclick = addToCart;
    document.querySelector('.checkout-btn').onclick = finalCheckout;
}

// 加入購物車 (含 topping_limit.md 校驗)
function addToCart() {
    const drinkTemp = document.getElementById('select-temp').value;
    if (!state.selectedItem) { alert("請先選擇茶飲！"); return; }
    
    if (drinkTemp === 'Hot' && state.selectedTopping === '珍珠') {
        alert("很抱歉，基於茶飲品質堅持，熱飲暫不提供珍珠加購！");
        return;
    }

    const qty = parseInt(document.getElementById('input-qty').value) || 1;
    const toppingPrice = state.selectedTopping ? 10 : 0;
    state.lastSubtotal = (state.selectedItem.price + toppingPrice) * qty;

    document.getElementById('cart-list').innerHTML = `
        ${state.selectedItem.name}(${state.selectedTopping || '無'}) x ${qty} 
        <span style="float: right;">$${state.lastSubtotal}</span>
    `;
    document.querySelector('.final-price').innerText = `小計：$${state.lastSubtotal}`;
}

// 結帳 (含 delivery_threshold.md 校驗)
function finalCheckout() {
    const dist = parseFloat(document.querySelector('.delivery-input').value);
    if (isNaN(dist)) { alert("請輸入配送距離！"); return; }
    if (dist > 5) { alert("配送上限為 5 公里。"); return; }

    let shipping = (dist > 3 && state.lastSubtotal < 300) ? 50 : 0;
    const total = state.lastSubtotal + shipping;

    alert(`【A111222017 結帳系統】\n總計：$${total}\n(含運費：$${shipping})`);
}

// 載入執行
window.onload = initSystem;