"use client";

interface SertifikatData {
  nomor: string;
  namaSiswa: string;
  namaKursus: string;
  namaGuru: string;
  nilai: number;
  tanggal: string;
  qrCodeUrl?: string;
}

export function SertifikatTemplate({
  nomor,
  namaSiswa,
  namaKursus,
  namaGuru,
  nilai,
  tanggal,
  qrCodeUrl,
}: SertifikatData) {
  return (
    <div className="w-[1123px] h-[794px] bg-white relative overflow-hidden font-sans" style={{ fontFamily: "Bricolage Grotesque, Inter, sans-serif" }}>
      <div className="absolute inset-4 border-8 border-[#005231] rounded-sm" />
      <div className="absolute inset-8 border-2 border-[#005231]/30 rounded-sm" />

      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#005231] via-[#eec055] to-[#005231]" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#005231] via-[#eec055] to-[#005231]" />

      <div className="absolute top-12 left-0 right-0 flex justify-center">
        <div className="w-24 h-24 rounded-full bg-[#005231]/10 flex items-center justify-center border-4 border-[#005231]/20">
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#005231]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" opacity="0.2" />
          </svg>
        </div>
      </div>

      <div className="absolute top-40 left-0 right-0 text-center">
        <p className="text-sm tracking-[0.3em] uppercase text-[#5a4200] font-semibold mb-1">Sertifikat Kelulusan</p>
        <h1 className="text-4xl font-bold text-[#005231] tracking-tight font-heading">AKAL Center</h1>
        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#eec055] to-transparent mx-auto mt-3" />
      </div>

      <div className="absolute top-[280px] left-0 right-0 text-center px-24">
        <p className="text-lg text-[#5a4200]/70 mb-1">Diberikan kepada</p>
        <h2 className="text-3xl font-bold text-[#005231] font-heading mb-1">{namaSiswa}</h2>
        <div className="w-64 h-px bg-[#005231]/20 mx-auto my-4" />
        <p className="text-base text-[#5a4200]/70 mb-1">Atas keberhasilan menyelesaikan kursus</p>
        <h3 className="text-2xl font-bold text-[#005231] font-heading mb-3">{namaKursus}</h3>
        <p className="text-base text-[#5a4200]/70">dengan nilai akhir</p>
        <div className="inline-block mt-2 px-8 py-2 bg-[#005231]/5 rounded-full border-2 border-[#005231]/20">
          <span className="text-3xl font-bold text-[#005231]">{nilai}</span>
        </div>
      </div>

      <div className="absolute bottom-[180px] left-0 right-0 flex justify-between px-24">
        <div className="text-left">
          <p className="text-xs text-[#5a4200]/50 uppercase tracking-wider mb-1">Nomor Sertifikat</p>
          <p className="text-sm font-mono text-[#5a4200]">{nomor}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#5a4200]/50 uppercase tracking-wider mb-1">Tanggal</p>
          <p className="text-sm text-[#5a4200]">{tanggal}</p>
        </div>
      </div>

      <div className="absolute bottom-[100px] left-0 right-0 flex justify-between items-end px-24">
        <div className="text-left">
          <div className="w-40 h-px bg-[#005231]/30 mb-2" />
          <p className="text-sm font-semibold text-[#005231]">{namaGuru}</p>
          <p className="text-xs text-[#5a4200]/50">Guru Pengajar</p>
        </div>

        {qrCodeUrl && (
          <div className="text-center">
            <img src={qrCodeUrl} alt="QR Verifikasi" className="w-20 h-20 border-2 border-[#005231]/20 rounded-lg p-1" />
            <p className="text-[10px] text-[#5a4200]/40 mt-1">Scan untuk verifikasi</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[10px] text-[#5a4200]/30 tracking-wider">AKAL CENTER &bull; AKIDAH AKHLAK &bull; DEEP LEARNING</p>
      </div>
    </div>
  );
}