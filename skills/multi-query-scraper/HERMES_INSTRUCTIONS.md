# Instruksi Hermes — Cara Pakai Multi-Query Scraper Skill

## Langkah 1: Setup (Satu Kali Aja)

### Test tanpa Chrome (WORKS NOW ✅)
```bash
cd ~/.agents/skills/multi-query-scraper
python3 -u test.py
# Output: /home/ngome/Desktop/Test_Multi_Query_Output.xlsx
```

**Ini selalu berhasil. Gunakan untuk quick testing.**

---

## Langkah 2: Real Search (Perlu Chrome Running)

### Step 1: Start Chrome (Manual, sekali aja)
```bash
# Di terminal terpisah, jalankan ini SEKALI:
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-data &
```

Tunggu 3 detik sampai Chrome muncul.

### Step 2: Verify Chrome Ready
```bash
# Check Chrome listening on port 9222
curl -s http://localhost:9222/json/version | python3 -m json.tool
```

Kalau lihat response dengan Browser info → Chrome ready ✅

### Step 3: Run Scraper
```bash
cd ~/.agents/skills/multi-query-scraper
python3 -u coba_kuliner.py
# Output: /home/ngome/Desktop/Kuliner_Jaksel.xlsx
```

---

## Troubleshooting

### ❌ "Chrome gak running di localhost:9222"
```bash
# Fix: Start Chrome dulu
google-chrome --remote-debugging-port=9222 &
sleep 3
# Terus coba lagi
python3 -u coba_kuliner.py
```

### ❌ "Gagal connect ke browser"
```bash
# Cek Chrome still running
curl http://localhost:9222/json/version

# Kalau error, kill Chrome dan restart
killall chrome 2>/dev/null
sleep 2
google-chrome --remote-debugging-port=9222 &
sleep 3
python3 -u coba_kuliner.py
```

### ❌ "0 hasil"
- Chrome mungkin mati
- atau Maps ada loading issue
- Coba lagi, usually works pada percobaan 2x

---

## Habit yang Benar untuk Hermes

✅ **DO:**
1. Check Chrome sudah running: `curl -s http://localhost:9222/json/version`
2. Kalau fail, start Chrome
3. Run scraper dengan `-u` flag (unbuffered)

❌ **DON'T:**
1. Jangan coba start Chrome dengan `&` di background lalu langsung run scraper
   - Chrome butuh 2-3 detik untuk fully start
2. Jangan skip Chrome check
3. Jangan run multiple scraper sekaligus (Maps akan throttle)

---

## Quick Commands untuk Hermes

```bash
# Test cepat (gak perlu Chrome)
python3 -u ~/.agents/skills/multi-query-scraper/test.py

# Check Chrome status
curl -s http://localhost:9222/json/version | grep Browser

# Start Chrome
google-chrome --remote-debugging-port=9222 &

# Real scraper
python3 -u ~/.agents/skills/multi-query-scraper/coba_kuliner.py

# Check output
ls -lh ~/Desktop/*.xlsx
```

---

## Kapan Gunakan Apa

| Task | Command | Chrome? | Time |
|------|---------|---------|------|
| Quick test | `test.py` | ❌ | <1 min ✅ |
| Learn skill | `test.py` | ❌ | <1 min ✅ |
| Real search | `coba_kuliner.py` | ✅ | 2-3 min |
| Change location | Edit script | ✅ | 5 sec |

---

## Summary untuk Hermes

1. **Mock test** (always works):
   ```bash
   python3 -u test.py
   ```

2. **Real test** (requires Chrome):
   ```bash
   google-chrome --remote-debugging-port=9222 &  # Start once
   sleep 3
   python3 -u coba_kuliner.py                     # Run anytime
   ```

3. **Check results**:
   ```bash
   ls -lh ~/Desktop/Kuliner_Jaksel.xlsx
   ```

**That's it. Jangan complicated.**
