import { MessageSquare, Send, User, ShieldCheck } from "lucide-react";

type DiskusiItem = {
  id: string;
  userName: string;
  role: "SISWA" | "GURU";
  pertanyaan: string;
  jawaban: string | null;
  createdAt: string;
};

const mockDiskusi: DiskusiItem[] = [
  {
    id: "1",
    userName: "Ahmad",
    role: "SISWA",
    pertanyaan: "Bagaimana cara memahami konsep tauhid dengan lebih mudah?",
    jawaban:
      "Coba pahami dari contoh sehari-hari. Tauhid itu seperti kamu percaya hanya satu remote TV yang bisa mengontrol TV-mu. Begitu juga Allah, hanya Dia yang mengatur alam semesta.",
    createdAt: "2 jam lalu",
  },
  {
    id: "2",
    userName: "Siti",
    role: "SISWA",
    pertanyaan: "Apa perbedaan antara akhlak dan moral?",
    jawaban: null,
    createdAt: "5 jam lalu",
  },
];

export default function DiskusiPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-on-surface mb-2">Diskusi</h1>
        <p className="text-sm text-on-surface-variant">
          Tanyakan apa yang belum kamu pahami. Guru akan menjawab pertanyaan kamu.
        </p>
      </div>

      <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass mb-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <textarea
            placeholder="Tulis pertanyaan kamu di sini..."
            className="flex-1 min-h-[80px] p-3 rounded-xl border border-border-precision bg-white text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/40 resize-y"
          />
        </div>
        <div className="flex justify-end">
          <button className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all">
            <Send className="w-4 h-4" />
            Kirim Pertanyaan
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {mockDiskusi.map((item) => (
          <div key={item.id} className="bg-glass border border-border-precision rounded-2xl p-5 shadow-glass">
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.role === "GURU" ? "bg-primary/10" : "bg-surface"
                }`}
              >
                {item.role === "GURU" ? (
                  <ShieldCheck className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-on-surface-variant" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-on-surface">{item.userName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.role === "GURU"
                        ? "bg-primary/10 text-primary"
                        : "bg-surface text-on-surface-variant"
                    }`}
                  >
                    {item.role === "GURU" ? "Guru" : "Siswa"}
                  </span>
                  <span className="text-xs text-on-surface-variant/50">{item.createdAt}</span>
                </div>
                <p className="text-sm text-on-surface">{item.pertanyaan}</p>
              </div>
            </div>

            {item.jawaban && (
              <div className="ml-11 mt-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Jawaban Guru</span>
                </div>
                <p className="text-sm text-on-surface leading-relaxed">{item.jawaban}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}