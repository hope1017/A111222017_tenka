---
功能名稱: 結帳金額運算模組 (Calculation Engine)
版本編號: v2.0.0
修改日期: 2026-04-30
---

# 核心技能：產品金額自動化結算

## 1. 運算步驟與公式
本技能依據以下順序計算最終應付總額：

1. **品項小計**：`Σ(單價 × 數量)`。
2. **折扣碼套用**：若輸入 `TENKA_80`，小計打 8 折。
3. **滿額折抵**：依據 `rules/discount_threshold.md`，每滿 $1000 折 $100。
4. **運費計算**：依據 `rules/delivery_threshold.md` 判定。
   - 若 `3 < distance <= 5` 且 `折扣後金額 < 300`：則加收 $50。

## 2. 運算矩陣 (Logic Matrix)
$$FinalTotal = (Subtotal \times DiscountRate) - ThresholdDiscount + ShippingFee$$

| 運算階段 | 輸入參數 | 參考規則 | 輸出 |
| :--- | :--- | :--- | :--- |
| **Step 1** | qty, price | Knowledge | 小計 |
| **Step 2** | 小計, promo | Knowledge | 折後金額 |
| **Step 3** | 折後金額 | discount_threshold | 實付金額 |
| **Step 4** | 實付金額, dist | delivery_threshold | **最終總計 (含運費)** |