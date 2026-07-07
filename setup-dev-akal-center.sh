#!/bin/bash
# setup-dev-akal-center.sh
# Install semua tool dasar untuk development Next.js + Drizzle + Supabase di Ubuntu
# Cara pakai: chmod +x setup-dev-akal-center.sh && ./setup-dev-akal-center.sh

set -e  # stop kalau ada error di tengah jalan

echo "=================================================="
echo "1/6 - Update daftar paket Ubuntu"
echo "=================================================="
sudo apt update

echo "=================================================="
echo "2/6 - Install Git"
echo "=================================================="
sudo apt install -y git
git --version

echo "=================================================="
echo "3/6 - Install Node.js via nvm (LTS)"
echo "=================================================="
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
node -v
npm -v

echo "=================================================="
echo "4/6 - Install PostgreSQL client tools (psql, buat cek koneksi manual)"
echo "=================================================="
sudo apt install -y postgresql-client
psql --version

echo "=================================================="
echo "5/6 - Install Docker (dibutuhkan Supabase CLI lokal)"
echo "=================================================="
if ! command -v docker &> /dev/null; then
  sudo apt install -y docker.io
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"
  echo ">> PENTING: logout lalu login lagi (atau restart terminal) supaya izin docker aktif."
else
  echo "Docker sudah terpasang, skip."
fi

echo "=================================================="
echo "6/6 - Install Supabase CLI (opsional, untuk testing Supabase lokal)"
echo "=================================================="
npm install -g supabase
supabase --version

echo ""
echo "=================================================="
echo "SELESAI. Ringkasan versi yang terpasang:"
echo "=================================================="
echo "Node.js : $(node -v)"
echo "npm     : $(npm -v)"
echo "Git     : $(git --version)"
echo "psql    : $(psql --version)"
echo "Docker  : $(docker --version 2>/dev/null || echo 'perlu logout/login dulu untuk cek')"
echo "Supabase: $(supabase --version)"
echo ""
echo "Langkah selanjutnya:"
echo "1. masuk ke folder project: cd /path/ke/akal-center"
echo "2. npm install"
echo "3. npm install drizzle-orm && npm install -D drizzle-kit"
echo "4. buat akun di supabase.com, ambil DATABASE_URL + kunci lainnya"
echo "5. taruh semua kunci itu di file .env.local"
echo "6. npx drizzle-kit push   (kirim schema ke database Supabase)"
echo "7. npm run dev"
