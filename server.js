const express = require('express');
const Database = require("@replit/database");
const db = new Database();
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// 1. كود تفعيل اللفة المجانية (DMN)
app.post('/verify-promo', async (req, res) => {
    const { username, code } = req.body;
    if (code === "DMN") {
        const used = await db.get(`used_${username}`);
        if (!used) {
            let spins = await db.get(username) || 0;
            await db.set(username, spins + 1);
            await db.set(`used_${username}`, true);
            return res.json({ success: true, message: "تمت إضافة لفة مجانية لـ DMN!" });
        }
        return res.json({ success: false, message: "استخدمت الكود سابقاً!" });
    }
    res.json({ success: false, message: "كود خاطئ" });
});

// 2. أمر لف العجلة (يخصم لفة ويرسل النتيجة)
app.post('/spin-wheel', async (req, res) => {
    const { username } = req.body;
    let spins = await db.get(username) || 0;
    if (spins > 0) {
        await db.set(username, spins - 1);
        // هنا نحدد الجائزة برمجياً (أمان 100%)
        const result = Math.floor(Math.random() * 6); 
        res.json({ success: true, prizeIndex: result, remaining: spins - 1 });
    } else {
        res.json({ success: false, message: "لا تملك لفات، اشترِ من DMN" });
    }
});

// 3. لوحة تحكم DMN (لإضافة لفات للأعضاء)
app.post('/admin-add', async (req, res) => {
    const { adminKey, targetUser, amount } = req.body;
    if (adminKey === "DMN_SECRET_123") { // كلمة سرك الخاصة
        let current = await db.get(targetUser) || 0;
        await db.set(targetUser, current + parseInt(amount));
        res.json({ success: true });
    }
});

app.listen(3000);
                              
