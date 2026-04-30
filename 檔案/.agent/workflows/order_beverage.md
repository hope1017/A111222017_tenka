---
description: 
---

---
功能名稱: 智慧點餐 SOP 流程 (Order SOP)
版本編號: v1.1.0
修改日期: 2026-04-30
---

# 操作流程：智慧點餐 SOP

| 狀態 (State) | 執行動作 (Action) | 下一狀態 |
| :--- | :--- | :--- |
| **S0** | 調用 `get_weather_skill` → 套用 `weather_recommendation` → 顯示推薦開場白 | S1 |
| **S1** | 顧客選品項、溫度、數量、外送距離 | S2 |
| **S2** | 執行 `delivery_threshold` 校驗 (上限 5km) | 通過轉 S3 |
| **S3** | 調用 `calculate_total` (包含運費與折扣計算) | S4 |
| **S4** | 顯示最終明細 (A111222017 結帳系統) 並確認訂單 | 結束 |