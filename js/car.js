const app = Vue.createApp({
    data() {
        return {
            cars: [],
            page: 1,
            perPage: 10,
            loading: true   // Skeleton UI 控制（仍保留頁面載入動畫，但圖片不再使用 fallback）
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
                const res = await fetch("http://localhost:8080/api/car");
                if (!res.ok) throw new Error("API 回傳錯誤");

                const data = await res.json();

                // 直接使用 API 提供的 image_path，不再使用 fallback
                this.cars = (data || []).map(c => ({
                    ...c,
                    validImage: c.image_path   // 直接使用 API 路徑
                }));
                
            } catch (err) {
                console.error("取得車輛資料失敗:", err);
                this.cars = [];
            } finally {
                this.loading = false;
            }
        },

        // 取消圖片錯誤 fallback
        onImgError(event) {
            // 不做任何處理，保留 API 的圖片連結
        },

        gotoDetail(car) {
            alert(`前往車輛詳細頁面（ID=${car.id}）\n（尚未實作頁面）`);
        },

        gotoBuy(car) {
            alert(`前往購買頁面（ID=${car.id}）\n（尚未實作頁面）`);
        }
    },

    mounted() {
        this.fetchCars();
    }
});

app.mount("#app");
