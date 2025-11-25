const app = Vue.createApp({
    data() {
        return {
            cars: [],
            page: 1,
            perPage: 12, // 配合 RWD，建議設為 4 的倍數 (12, 16...)
            loading: true
        };
    },

    computed: {
        totalPages() {
            return Math.ceil(this.cars.length / this.perPage);
        },

        paginatedCars() {
            const start = (this.page - 1) * this.perPage;
            return this.cars.slice(start, start + this.perPage);
        }
    },

    methods: {
        async fetchCars() {
            this.loading = true;
            try {
                // 指向後端 API
                const res = await fetch("http://localhost:8080/api/car");
                if (!res.ok) throw new Error("API 回傳錯誤");

                const data = await res.json();

                // 處理圖片路徑
                this.cars = (data || []).map(c => ({
                    ...c,
                    validImage: ('.' + c.imagePath)   // 直接使用 API 路徑
                }));
                
            } catch (err) {
                console.error("取得車輛資料失敗:", err);
                this.cars = [];
            } finally {
                this.loading = false;
            }
        },

        gotoBuy(car) {
            // ⭐ 修改：直接跳轉到後端的預約頁面 (與 index.html 行為一致)
            // 如果想帶入車輛 ID，可以改為: 
            // window.location.href = `http://localhost:8080/reserve?preSelectCar=${car.id}`;
            // (前提是您的 ReserveController 有寫接收參數的邏輯，若無則直接跳轉即可)
            window.location.href = "http://localhost:8080/reserve";
        }
    },

    mounted() {
        this.fetchCars();
    }
});

app.mount("#app");