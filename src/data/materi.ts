export interface BabMateri {
  slug: string;
  title: string;
  kelas: 7 | 8 | 9;
  bab: number;
  babLabel: string;
  ringkasan: string;
  subTopik: number;
  waktuBaca: string;
  icon: string;
  videoUrl?: string;
  soalUrl?: string;
  gameUrl?: string;
  dalil?: {
    surah: string;
    arab: string;
    arti: string;
  };
  dimensi?: {
    nomor: number;
    judul: string;
    deskripsi: string;
  }[];
  poinPenting: string[];
  pendahuluan: string;
  konten: {
    judul: string;
    isi: string;
  }[];
  prevSlug?: string;
  prevTitle?: string;
  nextSlug?: string;
  nextTitle?: string;
}

export const ALL_MATERI: Record<string, BabMateri> = {
  "beriman-kepada-malaikat": {
    slug: "beriman-kepada-malaikat",
    title: "Beriman kepada Malaikat",
    kelas: 7,
    bab: 1,
    babLabel: "AKIDAH",
    ringkasan: "Mengenal malaikat Allah dan tugas-tugasnya sebagai rukun iman.",
    subTopik: 6,
    waktuBaca: "5 MIN BACA",
    icon: "\u{1FABD}",
    videoUrl: "https://www.youtube.com/embed/044uWVfxaKo",
    soalUrl: "/pdf/beriman-kepada-malaikat-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-malaikat",
    pendahuluan: "Iman kepada malaikat adalah rukun iman kedua yang wajib diyakini setiap muslim. Malaikat adalah makhluk Allah yang diciptakan dari cahaya, selalu taat, dan memiliki tugas masing-masing.",
    konten: [
      {
        judul: "Pengertian Malaikat",
        isi: "Malaikat berasal dari bahasa Arab 'malak' yang berarti kekuatan. Malaikat adalah makhluk ghaib yang diciptakan Allah dari cahaya (nur), tidak memiliki nafsu, selalu taat, dan tidak pernah bermaksiat kepada Allah. Mereka memiliki tugas-tugas tertentu yang diamanahkan oleh Allah.",
      },
      {
        judul: "Nama-nama Malaikat dan Tugasnya",
        isi: "Ada 10 malaikat yang wajib diketahui: Jibril (menyampaikan wahyu), Mikail (membagi rezeki), Israfil (meniup sangkakala), Izrail (mencabut nyawa), Munkar & Nakir (menanya di kubur), Raqib & Atid (mencatat amal), Malik (penjaga neraka), dan Ridwan (penjaga surga).",
      },
      {
        judul: "Hikmah Beriman kepada Malaikat",
        isi: "Beriman kepada malaikat mendorong kita untuk selalu berhati-hati dalam bertindak karena setiap perbuatan dicatat. Juga meningkatkan rasa syukur atas nikmat yang diatur malaikat dan memotivasi untuk beramal saleh.",
      },
    ],
    dalil: {
      surah: "QS. An-Nisa [4]: 136",
      arab: "\u06D6\u064A\u0670\u0627\u064E\u0649\u0651\u064F\u0647\u064E\u0627 \u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u0652 \u0621\u064E\u0627\u0645\u0650\u0646\u064F\u0648\u0627\u0652 \u0628\u0650\u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0648\u064E\u0631\u064E\u0633\u064F\u0648\u0644\u0650\u0647\u0650\u06D7",
      arti: "Wahai orang-orang yang beriman, tetaplah beriman kepada Allah dan Rasul-Nya...",
    },
    dimensi: [
      { nomor: 1, judul: "Keyakinan dalam Hati", deskripsi: "Meyakini dengan sepenuh hati bahwa malaikat itu ada dan tugas-tugasnya sebagaimana diajarkan dalam Al-Qur'an dan Hadis." },
      { nomor: 2, judul: "Ucapan dengan Lisan", deskripsi: "Mengucapkan kalimat syahadat dan doa-doa yang berkaitan dengan iman kepada malaikat dalam kehidupan sehari-hari." },
      { nomor: 3, judul: "Perbuatan Anggota Tubuh", deskripsi: "Mengamalkan perilaku yang mencerminkan keimanan kepada malaikat, seperti jujur, amanah, dan istiqamah dalam ibadah." },
    ],
    poinPenting: [
      "Malaikat diciptakan dari cahaya, tidak memiliki nafsu, dan selalu taat.",
      "Ada 10 malaikat yang wajib diketahui dengan tugas masing-masing.",
      "Iman kepada malaikat mempengaruhi perilaku sehari-hari.",
    ],
    nextSlug: "membiasakan-tabayyun-menjauhi-ghibah",
    nextTitle: "Tabayyun & Ghibah",
  },

  "membiasakan-tabayyun-menjauhi-ghibah": {
    slug: "membiasakan-tabayyun-menjauhi-ghibah",
    title: "Membiasakan Tabayyun, Menjauhi Ghibah",
    kelas: 7,
    bab: 2,
    babLabel: "AKHLAK",
    ringkasan: "Belajar memverifikasi informasi dan menjaga lisan dari ghibah di era digital.",
    subTopik: 5,
    waktuBaca: "4 MIN BACA",
    icon: "\uD83D\uDD0D",
    videoUrl: "https://www.youtube.com/embed/G_rCQPIR1Uk",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/membiasakan-tabayyun-dan-menjauhi-ghibah",
    pendahuluan: "Di era digital, kemampuan memverifikasi informasi menjadi sangat penting. Islam mengajarkan tabayun sebagai sikap tidak tergesa-gesa dalam menilai sesuatu dan selalu mencari kebenaran informasi sebelum menyebarkannya.",
    konten: [
      {
        judul: "Pengertian Tabayun",
        isi: "Tabayun berasal dari kata tabayyana yang berarti jelas, terang, dan tampak. Menurut Quraish Shihab, tabayun berarti telitilah dan bersungguh-sungguh. Tabayun adalah sikap tidak tergesa-gesa dalam menilai sesuatu dengan didahului upaya mencari informasi yang benar sehingga isinya dapat dipertanggungjawabkan.",
      },
      {
        judul: "Kandungan QS. Al-Hujurat [49]: 6",
        isi: "Ayat ini memerintahkan: jika seorang fasik datang membawa berita penting, jangan tergesa-gesa menerimanya. Telitilah kebenarannya agar tidak mencelakakan suatu kaum karena kebodohan yang akhirnya menyesal. Ini menjadi landasan utama tentang tabayun dalam Islam.",
      },
      {
        judul: "Langkah-Langkah Bertabayun",
        isi: "Dua langkah utama: (1) Membaca \u2014 mencari informasi untuk diteliti, membedakan berita benar dan salah. (2) Bertanya \u2014 kepada orang yang mempunyai pemahaman lebih dan dapat dipercaya. Ciri tabayun: mempunyai manfaat, memastikan sumber informasi, waktu dan tempat informasi benar, serta klarifikasi bebas dari kesalahan.",
      },
      {
        judul: "Pengertian Ghibah",
        isi: "Ghibah secara etimologi berarti ghaib atau tidak hadir. Secara syar'i, ghibah adalah menceritakan seseorang yang tidak di tempat dengan sesuatu yang tidak disukainya, baik aib badan, keturunan, akhlak, perbuatan, urusan agama, maupun dunia.",
      },
      {
        judul: "Dampak Buruk Ghibah",
        isi: "Ghibah menguras emosi dan merusak suasana hati, merusak reputasi diri, membuat orang lain resah, memudahkan pelaku menghakimi, merusak relasi, dan dapat menyebabkan depresi, bullying, serta masalah fisik dan mental. Cara menghindari: jangan mudah percaya informasi tidak jelas, tahan diri untuk tidak berkomentar, hentikan kebiasaan membicarakan orang lain di belakang.",
      },
    ],
    dalil: {
      surah: "QS. Al-Hujurat [49]: 6",
      arab: "\u06D6\u064A\u0670\u0627\u064E\u0649\u0651\u064F\u0647\u064E\u0627 \u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u0652 \u0625\u0650\u0646 \u062C\u064E\u0627\u0621\u064E\u0643\u064F\u0645\u0652 \u0641\u064E\u0627\u0633\u0650\u0642\u064C \u0628\u0650\u0646\u064E\u0628\u064E\u0625\u064D \u0641\u064E\u062A\u064E\u0628\u064E\u064A\u0651\u064E\u0646\u064F\u0648\u0627\u0652",
      arti: "Wahai orang-orang yang beriman, jika seorang fasik datang kepadamu membawa suatu berita, maka telitilah kebenarannya.",
    },
    poinPenting: [
      "Tabayun berarti verifikasi dan klarifikasi informasi sebelum mempercayainya.",
      "Ghibah adalah menceritakan aib orang lain saat ia tidak hadir.",
      "QS. Al-Hujurat ayat 6 dan 12 menjadi landasan utama tabayun dan larangan ghibah.",
    ],
    prevSlug: "beriman-kepada-malaikat",
    prevTitle: "Beriman kepada Malaikat",
    nextSlug: "salat-mencegah-perbuatan-keji-dan-mungkar",
    nextTitle: "Salat Mencegah Keji",
  },

  "salat-mencegah-perbuatan-keji-dan-mungkar": {
    slug: "salat-mencegah-perbuatan-keji-dan-mungkar",
    title: "Salat Mencegah Perbuatan Keji",
    kelas: 7,
    bab: 3,
    babLabel: "AKHLAK",
    ringkasan: "Memahami hikmah salat sebagai benteng dari perbuatan keji dan mungkar.",
    subTopik: 7,
    waktuBaca: "6 MIN BACA",
    icon: "\uD83D\uDD4C",
    videoUrl: "https://www.youtube.com/embed/47RUiGZ5804",
    soalUrl: "/pdf/salat-mencegah-perbuatan-keji-dan-mungkar-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/salat-mencegah-perbuatan-keji-dan-mungkarr",
    pendahuluan: "Salat bukan sekadar ritual, tetapi benteng moral yang mencegah pelakunya dari perbuatan keji dan mungkar. Bab ini mengupas makna salat, ketentuannya, dan hikmah di balik perintah salat.",
    konten: [
      {
        judul: "Makna Salat",
        isi: "Salat secara bahasa berarti doa. Secara istilah syara', salat adalah ucapan dan pekerjaan yang dimulai dengan takbir dan diakhiri dengan salam dengan syarat tertentu. Salat menghubungkan hamba kepada Penciptanya, menjadi manifestasi penghambaan dan kebutuhan diri kepada Allah. Salat melatih tawaduk dan menumbuhkan akhlak terpuji seperti keberanian dan ketabahan.",
      },
      {
        judul: "Pengertian Keji dan Mungkar",
        isi: "Keji (fahsya') adalah perbuatan atau kejahatan yang menimbulkan aib besar dan melanggar susila, termasuk dosa besar seperti membunuh, membangkang orang tua, syirik, berbuat aniaya, fitnah, dan zina. Mungkar adalah segala perbuatan yang mengingkari syariat dan bertentangan dengan fitrah serta maslahah.",
      },
      {
        judul: "Syarat dan Rukun Salat",
        isi: "Syarat wajib salat: Islam, balig, berakal sehat, tidak haid/nifas. Syarat sah: Islam, mumayyiz, masuk waktu, suci dari hadas dan najis, menutup aurat, menghadap kiblat. Rukun salat (15): niat, takbiratulihram, berdiri, baca Al-Fatihah, rukuk, iktidal, sujud, duduk antara dua sujud, tumakninah, tasyahud akhir, shalawat, duduk tasyahud, salam, tertib.",
      },
      {
        judul: "Hal yang Membatalkan Salat",
        isi: "Sepuluh hal membatalkan salat: terkena najis, berhadas, meninggalkan rukun sengaja, bicara di luar bacaan, makan/minum, aurat terbuka, gerakan lebih dari tiga berturut-turut, mengubah niat, membelakangi kiblat, tertawa keras sengaja.",
      },
      {
        judul: "Hikmah Salat Khusyuk",
        isi: "Enam hikmah salat khusyuk: (1) Mencegah dari perbuatan mungkar \u2014 QS. Al-Ankabut [29]: 45. (2) Mendidik pribadi yang disiplin \u2014 salat pada waktu tertentu mengajarkan disiplin. (3) Melatih pribadi yang tangguh \u2014 QS. Al-Ma'arij [70]: 19-23. (4) Meninggikan derajat \u2014 setiap sujud mengangkat satu derajat. (5) Membersihkan kesalahan dan dosa \u2014 salat mengampuni dosa antara satu salat dengan berikutnya. (6) Meraih pertolongan Allah.",
      },
    ],
    dalil: {
      surah: "QS. Al-Ankabut [29]: 45",
      arab: "\u06D6\u0625\u0650\u0646\u0651\u064E \u0671\u0644\u0635\u0651\u064E\u0644\u064E\u0648\u0670\u0629\u064E \u062A\u064E\u0646\u0652\u0647\u064E\u0649\u0670 \u0639\u064E\u0646\u0650 \u0671\u0644\u0652\u0641\u064E\u062D\u0652\u0634\u064E\u0627\u0621\u0650 \u0648\u064E\u0671\u0644\u0652\u0645\u064F\u0646\u0643\u064E\u0631\u0650",
      arti: "Sesungguhnya salat itu mencegah dari perbuatan keji dan mungkar.",
    },
    dimensi: [
      { nomor: 1, judul: "Salat sebagai Benteng Moral", deskripsi: "Salat yang khusyuk membentuk pribadi yang sadar bahwa Allah selalu mengawasi, sehingga mencegah perbuatan keji dan mungkar." },
      { nomor: 2, judul: "Salat Mendidik Kedisiplinan", deskripsi: "Salat lima waktu pada waktu yang telah ditentukan melatih disiplin, tanggung jawab, dan manajemen waktu." },
      { nomor: 3, judul: "Salat sebagai Sarana Dekat dengan Allah", deskripsi: "Melalui salat, hamba berada dalam posisi terdekat dengan Tuhannya, meraih ketenangan jiwa dan pertolongan-Nya." },
    ],
    poinPenting: [
      "Salat adalah tiang agama yang mencegah perbuatan keji dan mungkar.",
      "Keji (fahsya') adalah perbuatan buruk melampaui batas; mungkar adalah kedurhakaan kepada Allah.",
      "Khusyuk dan tumakninah adalah kunci salat yang sempurna.",
    ],
    prevSlug: "membiasakan-tabayyun-menjauhi-ghibah",
    prevTitle: "Tabayyun & Ghibah",
    nextSlug: "melestarikan-alam-cerminan-orang-beriman",
    nextTitle: "Melestarikan Alam",
  },

  "melestarikan-alam-cerminan-orang-beriman": {
    slug: "melestarikan-alam-cerminan-orang-beriman",
    title: "Melestarikan Alam sebagai Cerminan Orang Beriman",
    kelas: 7,
    bab: 4,
    babLabel: "AKHLAK",
    ringkasan: "Menjaga dan melestarikan alam sebagai wujud keimanan kepada Allah SWT.",
    subTopik: 5,
    waktuBaca: "5 MIN BACA",
    icon: "\uD83C\uDF33",
    videoUrl: "https://www.youtube.com/embed/ZT-dbhqxtCo",
    soalUrl: "/pdf/melestarikan-alam-cerminan-orang-beriman-soal.pdf",
    prevSlug: "salat-mencegah-perbuatan-keji-dan-mungkar",
    prevTitle: "Salat Mencegah Keji & Mungkar",
    pendahuluan: "Melestarikan alam adalah cerminan keimanan seorang muslim. Allah menciptakan alam semesta dengan sempurna dan memberikan amanah kepada manusia untuk menjaganya. Manusia sebagai khalifah di bumi bertanggung jawab memakmurkan dan melestarikan alam, bukan merusaknya.",
    konten: [
      {
        judul: "Kandungan Surah Al-Furqan [25] Ayat 48\u201349",
        isi: "Ayat ini menggambarkan kekuasaan Allah Yang Mahasempurna, yaitu Dialah yang meniupkan angin sebagai pembawa kabar gembira akan datangnya hujan. Allah menurunkan air hujan dalam keadaan amat bersih (suci lagi menyucikan). Tanah yang kering menjadi hidup setelah menerima hujan, dipenuhi tetumbuhan dengan bunga-bungaan beraneka warna. Manusia dan hewan sangat membutuhkan air. Inilah anugerah Allah yang perlu direnungkan manusia sebagai bentuk syukur atas nikmat alam.",
      },
      {
        judul: "Kandungan Surah Al-A\u2019raf [7] Ayat 56",
        isi: "Allah melarang manusia berbuat kerusakan di bumi setelah diciptakan dengan baik. Allah tidak menyukai orang-orang yang melampaui batas. Manusia diperintahkan berdoa kepada Allah dengan rasa takut dan harapan. Sesungguhnya rahmat Allah sangat dekat kepada orang yang berbuat kebaikan. Ayat ini menjadi landasan utama tentang larangan merusak alam dan lingkungan.",
      },
      {
        judul: "Pentingnya Melestarikan Alam",
        isi: "Manusia menjadi faktor penentu dalam menjaga kelestarian lingkungan. Keserakahan manusia dalam menguasai alam sering menimbulkan kerusakan seperti kerusakan sumber daya alam, penyusutan hutan, erosi, sungai tercemar, dan polusi udara. Kerusakan di darat seperti pembangunan di daerah resapan air menyebabkan banjir dan tanah longsor. Kerusakan di laut seperti pencemaran air laut merusak ekosistem. Allah telah menghamparkan bumi beserta isinya sebagai sumber kehidupan, maka sudah sepantasnya manusia bersyukur.",
      },
      {
        judul: "Perilaku Melestarikan Alam",
        isi: "Beberapa perilaku yang mencerminkan pelestarian alam: (1) Menanam pohon sebagai kontribusi penghijauan dan sedekah jariyah. (2) Membuang sampah pada tempatnya. (3) Mendaur ulang barang bekas menjadi hal berguna. (4) Mengurangi penggunaan kendaraan bermotor. (5) Menggunakan air seperlunya. (6) Menghemat penggunaan listrik. (7) Mengurangi konsumsi kemasan plastik sekali pakai. (8) Membawa tempat bekal dari rumah.",
      },
    ],
    dalil: {
      surah: "QS. Al-A\u2019raf [7]: 56",
      arab: "\u0648\u064E\u0644\u064E\u0627 \u062A\u064F\u0641\u0652\u0633\u0650\u062F\u064F\u0648\u0627\u0652 \u0641\u0650\u064A \u0671\u0644\u0623\u064E\u0631\u0652\u0636\u0650 \u0628\u064E\u0639\u0652\u062F\u064E \u0625\u0650\u0635\u0652\u0644\u064E\u0670\u062D\u0650\u0647\u064E\u0627",
      arti: "Dan janganlah kamu berbuat kerusakan di bumi setelah (diciptakan) dengan baik.",
    },
    dimensi: [
      { nomor: 1, judul: "Alam sebagai Amanah Allah", deskripsi: "Alam semesta adalah amanah Allah yang harus dijaga dan dilestarikan, bukan dieksploitasi untuk kepentingan sesaat." },
      { nomor: 2, judul: "Larangan Merusak Alam", deskripsi: "Allah melarang keras perbuatan merusak alam, baik di darat maupun di laut. Kerusakan alam adalah bentuk keingkaran terhadap nikmat Allah." },
      { nomor: 3, judul: "Syukur atas Nikmat Alam", deskripsi: "Melestarikan alam adalah wujud syukur kepada Allah atas nikmat ciptaan-Nya yang tak terhingga." },
    ],
    poinPenting: [
      "QS. Al-Furqan [25]: 48\u201349 menjelaskan nikmat air hujan sebagai rahmat Allah.",
      "QS. Al-A\u2019raf [7]: 56 melarang keras perbuatan merusak bumi.",
      "Menanam pohon adalah sedekah jariyah yang pahalanya terus mengalir.",
      "Melestarikan alam adalah wujud keimanan dan syukur kepada Allah.",
    ],
  },

  "amanah-dan-jujur": {
    slug: "amanah-dan-jujur",
    title: "Amanah dan Jujur",
    kelas: 8,
    bab: 1,
    babLabel: "AKHLAK",
    ringkasan: "Meneladani sifat amanah dan jujur dalam kehidupan sehari-hari.",
    subTopik: 8,
    waktuBaca: "5 MIN BACA",
    icon: "\uD83E\uDD1D",
    videoUrl: "https://www.youtube.com/embed/QHZGZ5m7kV0",
    soalUrl: "/pdf/amanah-dan-jujur-soal.pdf",
    gameUrl: "https://jujurdanamanah.my.canva.site/",
    pendahuluan: "Amanah dan jujur adalah dua pilar akhlak mulia yang harus dimiliki setiap muslim. Kejujuran membawa kebaikan, dan kebaikan membawa ke surga. Amanah adalah sifat yang membuat seseorang dipercaya oleh orang lain dan oleh Allah.",
    konten: [
      {
        judul: "Pengertian Jujur",
        isi: "Jujur (ash-shidq) artinya benar dan dapat dipercaya. Menurut Ibn Manzur, ash-shidq berarti yang sempurna benarnya, yang membenarkan ucapan dengan perbuatan. Jujur adalah kesesuaian antara ucapan dan perbuatan, antara informasi dan kenyataan.",
      },
      {
        judul: "Macam-Macam Kejujuran",
        isi: "Imam Al-Ghazali membagi kejujuran dalam lima hal: (1) Jujur dalam perkataan \u2014 setiap yang keluar dari mulut harus mengandung kebenaran. (2) Jujur dalam niat \u2014 tidak ada tindakan selain mengharap ridha Allah. (3) Jujur dalam kemauan \u2014 usaha terhindar dari kesalahan. (4) Jujur dalam menepati janji \u2014 janji adalah hutang yang wajib ditepati. (5) Jujur dalam perbuatan \u2014 realisasi dari setiap unsur kejujuran.",
      },
      {
        judul: "Hikmah Perilaku Jujur",
        isi: "Orang jujur tidak akan dihantui rasa bersalah dan hati yang gundah. Hatinya tentram, damai, dan bahagia. Sebaliknya, orang yang biasa berdusta hidupnya tidak tenang dan dikejar-kejar oleh penyesalan.",
      },
      {
        judul: "Pengertian Amanah",
        isi: "Amanah adalah lawan dari khianat. Setiap muslim wajib memiliki sifat amanah. Amanah berarti sesuatu yang diserahkan pada pihak lain untuk dipelihara dan dikembalikan bila tiba saatnya. Nilai-nilai pendidikan dari amanah: keadilan, kejujuran, dan takwa.",
      },
      {
        judul: "Ruang Lingkup Amanah",
        isi: "Tiga ruang lingkup amanah: (1) Amanah kepada Allah dan Rasul \u2014 melaksanakan perintah-Nya, menjauhi larangan-Nya. (2) Amanah kepada sesama manusia \u2014 menjaga titipan, menjaga rahasia, menaati undang-undang. (3) Amanah kepada diri sendiri \u2014 memilih yang maslahat, mendahulukan kebahagiaan dunia dan akhirat, menuntut ilmu, mencari nafkah, menjaga kesehatan.",
      },
    ],
    dalil: {
      surah: "QS. At-Taubah [9]: 119",
      arab: "\u06D6\u064A\u0670\u0627\u064E\u0649\u0651\u064F\u0647\u064E\u0627 \u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u0652 \u0671\u062A\u0651\u064E\u0642\u064F\u0648\u0627\u0652 \u0671\u0644\u0644\u0651\u064E\u0647\u064E \u0648\u064E\u0643\u064F\u0648\u0646\u064F\u0648\u0627\u0652 \u0645\u064E\u0639\u064E \u0671\u0644\u0635\u0651\u064E\u0670\u062F\u0650\u0642\u0650\u064A\u0646\u064E",
      arti: "Wahai orang-orang yang beriman, bertakwalah kepada Allah dan hendaklah kamu bersama orang-orang yang benar (jujur).",
    },
    dimensi: [
      { nomor: 1, judul: "Jujur dalam Ucapan, Perbuatan, dan Niat", deskripsi: "Kejujuran mencakup kesesuaian antara apa yang diucapkan, dilakukan, dan diniatkan dalam hati." },
      { nomor: 2, judul: "Amanah kepada Allah, Sesama, dan Diri Sendiri", deskripsi: "Amanah meliputi kewajiban vertikal kepada Allah, kewajiban horizontal kepada sesama, dan tanggung jawab pada diri sendiri." },
      { nomor: 3, judul: "Meneladani Sifat Al-Amin", deskripsi: "Nabi Muhammad SAW dikenal sebagai Al-Amin (yang terpercaya) sebelum diangkat menjadi rasul, menjadi teladan sempurna dalam amanah dan kejujuran." },
    ],
    poinPenting: [
      "Jujur adalah kesesuaian antara ucapan dan perbuatan.",
      "Amanah berarti dapat dipercaya; khianat adalah lawannya.",
      "Nabi Muhammad SAW dikenal sebagai Al-Amin sebelum diangkat menjadi rasul.",
    ],
    nextSlug: "beriman-kepada-kitab-allah",
    nextTitle: "Beriman kepada Kitab Allah",
  },

  "beriman-kepada-kitab-allah": {
    slug: "beriman-kepada-kitab-allah",
    title: "Beriman kepada Kitab Allah",
    kelas: 8,
    bab: 2,
    babLabel: "AKIDAH",
    ringkasan: "Meyakini kitab-kitab Allah sebagai pedoman hidup umat manusia.",
    subTopik: 6,
    waktuBaca: "5 MIN BACA",
    icon: "\uD83D\uDCD6",
    videoUrl: "https://www.youtube.com/embed/bC-i_9hisSw",
    soalUrl: "/pdf/beriman-kepada-kitab-allah-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-kitab-allah",
    pendahuluan: "Iman kepada kitab-kitab Allah adalah rukun iman ketiga. Allah menurunkan kitab-kitab kepada para nabi sebagai petunjuk bagi umat manusia. Empat kitab utama yang wajib diimani: Taurat, Zabur, Injil, dan Al-Qur'an.",
    konten: [
      {
        judul: "Pengertian Iman kepada Kitab Allah",
        isi: "Iman kepada kitab-kitab Allah mencakup empat perkara: (1) Mengimani turunnya kitab dari sisi Allah. (2) Mengimani nama-nama kitab yang diketahui. (3) Membenarkan berita-beritanya yang benar. (4) Mengamalkan hukum-hukumnya yang tidak dihapus.",
      },
      {
        judul: "Kitab Taurat",
        isi: "Taurat diturunkan kepada Nabi Musa a.s. untuk Bani Israil pada abad 12 SM dalam bahasa Ibrani. Sepuluh firman Allah (10 Hukum) dalam Taurat: tidak ada Tuhan lain, jangan menyembah patung, jangan menyebut nama Allah sia-sia, ingat hari Sabat, hormati orang tua, jangan membunuh, berzina, mencuri, saksi palsu, dan mengingini hak orang lain.",
      },
      {
        judul: "Kitab Zabur dan Injil",
        isi: "Zabur diturunkan kepada Nabi Daud a.s. pada abad 10 SM, berisi mazmur dan nyanyian pujian kepada Tuhan. Injil diturunkan kepada Nabi Isa a.s. pada abad 1 M di Yerusalem, berisi perintah memahasucikan Allah, melarang syirik, serta keterangan akan datangnya Nabi Muhammad.",
      },
      {
        judul: "Kitab Al-Qur'an",
        isi: "Al-Qur'an diturunkan kepada Nabi Muhammad SAW selama 23 tahun. Kandungan pokok menurut Mahmud Syaltut: akidah, akhlak, dorongan hikmah alami, kisah umat terdahulu, janji baik dan ancaman buruk, serta hukum ibadah dan muamalah. Terbagi dalam dua periode: Makiyyah (akidah) dan Madaniyyah (syariat).",
      },
      {
        judul: "Keistimewaan Al-Qur'an",
        isi: "Sepuluh keistimewaan Al-Qur'an: (1) Isi tidak berubah sepanjang masa. (2) Terjaga dari kontradiksi. (3) Mudah dihafalkan. (4) Bahasa tidak dapat ditiru. (5) Membaca mendatangkan pahala. (6) Memberi ketenangan batin. (7) Kisah nyata dan terperinci. (8) Mendatangkan syafaat. (9) Hakim semua kitab sebelumnya. (10) Kitab peradaban.",
      },
    ],
    dalil: {
      surah: "QS. Al-Baqarah [2]: 136",
      arab: "\u06D6\u0642\u064F\u0648\u0644\u064F\u0648\u0627\u0652 \u0621\u064E\u0627\u0645\u064E\u0646\u0651\u064E\u0627 \u0628\u0650\u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0648\u064E\u0645\u064E\u0627 \u0623\u064F\u0646\u0632\u0650\u0644\u064E \u0625\u0650\u0644\u064E\u064A\u0652\u0646\u064E\u0627",
      arti: "Katakanlah: 'Kami beriman kepada Allah dan kepada apa yang diturunkan kepada kami.'",
    },
    dimensi: [
      { nomor: 1, judul: "Mengimani Keempat Kitab Allah", deskripsi: "Taurat, Zabur, Injil, dan Al-Qur'an adalah kitab suci yang wajib diimani sebagai petunjuk dari Allah." },
      { nomor: 2, judul: "Mempelajari dan Mengamalkan Isi Al-Qur'an", deskripsi: "Al-Qur'an sebagai kitab penyempurna harus dibaca, dipelajari, dan diamalkan dalam kehidupan sehari-hari." },
      { nomor: 3, judul: "Menjaga Kesucian dan Membela Kitab Suci", deskripsi: "Menghormati, menjaga kesucian, dan membela Al-Qur'an dari segala bentuk pelecehan adalah wujud iman kepada kitab Allah." },
    ],
    poinPenting: [
      "Empat kitab: Taurat (Musa), Zabur (Daud), Injil (Isa), Al-Qur'an (Muhammad).",
      "Al-Qur'an adalah kitab penyempurna yang terjamin keasliannya.",
      "Beriman kepada kitab Allah berarti mengimani, mempelajari, dan mengamalkan petunjuknya.",
    ],
    prevSlug: "amanah-dan-jujur",
    prevTitle: "Amanah dan Jujur",
    nextSlug: "beriman-kepada-nabi-dan-rasul",
    nextTitle: "Beriman kepada Nabi & Rasul",
  },

  "beriman-kepada-nabi-dan-rasul": {
    slug: "beriman-kepada-nabi-dan-rasul",
    title: "Beriman kepada Nabi dan Rasul",
    kelas: 8,
    bab: 3,
    babLabel: "AKIDAH",
    ringkasan: "Meneladani kisah para nabi dan rasul dalam menyampaikan risalah.",
    subTopik: 12,
    waktuBaca: "7 MIN BACA",
    icon: "\uD83C\uDF1F",
    soalUrl: "/pdf/beriman-kepada-nabi-dan-rasul-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-nabi-dan-rasul",
    pendahuluan: "Iman kepada nabi dan rasul adalah rukun iman keempat. Allah mengutus para nabi dan rasul untuk menyampaikan petunjuk-Nya kepada umat manusia. Wajib beriman kepada 25 nabi yang disebut dalam Al-Qur'an, dan meneladani sifat-sifat mulia mereka.",
    konten: [
      {
        judul: "Pengertian Iman kepada Rasul",
        isi: "Iman kepada rasul berarti mempercayai dengan sepenuh hati atas kedatangan rasul dari Nabi Adam a.s. hingga Nabi Muhammad SAW. Wajib beriman kepada 25 rasul yang disebut dalam Al-Qur'an. Menurut Imam Baidhawi, rasul diutus Allah dengan syariat baru, sedangkan nabi diutus untuk menjalankan syariat rasul sebelumnya.",
      },
      {
        judul: "Sifat Wajib dan Mustahil Rasul",
        isi: "Sifat wajib: (1) Ash-Shiddiq (benar/jujur). (2) Al-Amanah (dapat dipercaya). (3) At-Tabligh (menyampaikan wahyu). (4) Al-Fathanah (cerdik/bijaksana). Sifat mustahil: (1) Al-Kidzbu (dusta). (2) Al-Khianah (khianat). (3) Al-Kitman (menyembunyikan). (4) Al-Baladah (bodoh).",
      },
      {
        judul: "Rasul Ulul Azmi",
        isi: "Ulul Azmi adalah rasul pilihan dengan keteguhan dan kesabaran luar biasa. Lima rasul Ulul Azmi: (1) Nabi Nuh a.s. \u2014 berdakwah hampir seribu tahun, mukjizat kapal besar selamat dari banjir. (2) Nabi Ibrahim a.s. \u2014 menghancurkan berhala, api menjadi dingin. (3) Nabi Musa a.s. \u2014 tongkat menjadi ular, membelah lautan. (4) Nabi Isa a.s. \u2014 berbicara saat bayi, menghidupkan orang mati. (5) Nabi Muhammad SAW \u2014 membelah bulan, Al-Qur'an sebagai mukjizat terbesar.",
      },
      {
        judul: "Perilaku yang Mencerminkan Iman",
        isi: "Tiga belas perilaku: (1) Jujur. (2) Berkata baik dan benar. (3) Melaksanakan amanah. (4) Berjuang menegakkan kebenaran. (5) Gemar menuntut ilmu. (6) Membaca shalawat. (7) Tidak mengingkari janji. (8) Menaati risalah. (9) Meneladani perilaku mulia. (10) Ibadah sunnah. (11) Taat beribadah. (12) Membaca sejarah Nabi. (13) Membaca Al-Qur'an.",
      },
    ],
    dalil: {
      surah: "QS. An-Nisa [4]: 136",
      arab: "\u06D6\u064A\u0670\u0627\u064E\u0649\u0651\u064F\u0647\u064E\u0627 \u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u0652 \u0621\u064E\u0627\u0645\u0650\u0646\u064F\u0648\u0627\u0652 \u0628\u0650\u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0648\u064E\u0631\u064F\u0633\u064F\u0644\u0650\u0647\u0650",
      arti: "Wahai orang-orang yang beriman, tetaplah beriman kepada Allah dan Rasul-Nya.",
    },
    dimensi: [
      { nomor: 1, judul: "Meyakini Kenabian dan Kerasulan", deskripsi: "Percaya bahwa Allah mengutus nabi dan rasul sebagai pembawa petunjuk bagi umat manusia sepanjang masa." },
      { nomor: 2, judul: "Meneladani Sifat Mulia Para Rasul", deskripsi: "Menerapkan sifat siddiq, amanah, tabligh, dan fathanah dalam kehidupan sehari-hari." },
      { nomor: 3, judul: "Mencintai dan Mengikuti Risalah Nabi", deskripsi: "Membaca shalawat, menaati sunnah, dan menjadikan Nabi Muhammad SAW sebagai teladan utama (uswah hasanah)." },
    ],
    poinPenting: [
      "25 nabi dan rasul wajib diketahui, 5 di antaranya Ulul Azmi.",
      "Sifat wajib: Siddiq, Amanah, Tabligh, Fathanah.",
      "Nabi Muhammad SAW adalah penutup para nabi (khatamul anbiya).",
    ],
    nextSlug: "membangun-toleransi",
    nextTitle: "Membangun Toleransi",
    prevSlug: "beriman-kepada-kitab-allah",
    prevTitle: "Beriman kepada Kitab Allah",
  },

  "membangun-toleransi": {
    slug: "membangun-toleransi",
    title: "Membangun Toleransi",
    kelas: 8,
    bab: 4,
    babLabel: "AKHLAK",
    ringkasan: "Membangun sikap toleransi dalam kehidupan beragama dan bermasyarakat.",
    subTopik: 5,
    waktuBaca: "5 MIN BACA",
    icon: "\uD83E\uDD1D",
    videoUrl: "https://www.youtube.com/embed/GZHC7bqDHZg",
    soalUrl: "/pdf/membangun-toleransi-soal.pdf",
    nextSlug: "moderasi-beragama",
    nextTitle: "Moderasi Beragama",
    prevSlug: "beriman-kepada-nabi-dan-rasul",
    prevTitle: "Beriman kepada Nabi & Rasul",
    pendahuluan: "Toleransi (tasamuh) adalah sikap saling menghormati dan menghargai perbedaan dalam kehidupan bermasyarakat. Islam mengajarkan toleransi dalam batasan yang jelas, terutama dalam hubungan antarumat beragama. Allah menciptakan manusia berbangsa-bangsa dan bersuku-suku agar saling mengenal, bukan untuk saling bermusuhan.",
    konten: [
      {
        judul: "Pengertian Toleransi",
        isi: "Kata toleransi berasal dari bahasa Latin tolerare yang berarti menahan, membiarkan, dan tabah. Dalam bahasa Arab disebut tasamuh, dari kata samaha yang berarti ampun, maaf, dan lapang dada. Toleransi adalah sikap saling menghormati, saling menghargai keyakinan orang, tidak memaksakan kehendak, serta tidak mencela atau menghina agama lain. Dalam Islam, toleransi bukan hanya kepada sesama manusia tetapi juga kepada alam semesta, binatang, dan lingkungan hidup.",
      },
      {
        judul: "Kandungan QS. Al-Hujurat [49] Ayat 13",
        isi: "Ayat ini menjelaskan bahwa Allah menciptakan manusia dari seorang laki-laki (Adam) dan seorang perempuan (Hawa) dan menjadikannya berbangsa-bangsa, bersuku-suku agar saling mengenal dan menolong. Allah tidak menyukai kesombongan karena keturunan atau kekayaan. Yang paling mulia di sisi Allah hanyalah orang yang paling bertakwa. Ayat ini menegaskan bahwa semua manusia sama derajat kemanusiaannya.",
      },
      {
        judul: "Prinsip dan Batasan Toleransi",
        isi: "Toleransi yang dilarang adalah dalam masalah akidah, yaitu mempertukarkan akidah atau turut serta dalam peribadatan agama lain. Lima prinsip toleransi: (1) Untukmu agamamu, untukku agamaku (QS. Al-Kafirun [109]: 6). (2) Tidak berhubungan dengan perayaan nonmuslim. (3) Tidak menghadiri acara maksiat. (4) Toleransi sebatas wilayah muamalah. (5) Toleransi tidak berkenaan dengan akidah dan ibadah. Tiga konsep dasar toleransi menurut Islam: kebebasan beragama (al-hurriyyah al-diniyyah), kemanusiaan (al-insaniyyah), dan moderatisme (al-washatiyyah).",
      },
      {
        judul: "Toleransi dengan Umat Beragama",
        isi: "Rasulullah saw. telah menunjukkan sikap toleran dalam Piagam Madinah, siap bekerja sama dengan nonmuslim untuk saling melindungi. Perilaku toleransi: berbuat baik dan adil kepada setiap agama, menolong siapa pun tanpa memandang agama, tetap menjalin hubungan dengan kerabat nonmuslim, boleh memberi hadiah kepada nonmuslim, tidak memaksakan kehendak, tidak memaksakan orang lain menganut agama kita, tidak mencela atau menghina agama lain, dan tidak melarang umat lain beribadah sesuai keyakinannya.",
      },
      {
        judul: "Hikmah Toleransi",
        isi: "Beberapa hikmah bersikap toleransi: (1) Menyadari bahwa Allah menciptakan manusia dengan beragam bentuk fisik, ras, dan budaya. (2) Menciptakan perdamaian dan kerukunan antarmasyarakat. (3) Mendorong masyarakat menjadi insan yang adil dan bijak. (4) Masyarakat tidak mudah terprovokasi oleh isu-isu perpecahan. (5) Memupuk rasa persaudaraan antarsesama. (6) Memudahkan terjalinnya kerja sama dan gotong royong. (7) Terhindar dari perpecahan dan pertikaian.",
      },
    ],
    dalil: {
      surah: "QS. Al-Hujurat [49]: 13",
      arab: "\u064A\u0670\u0670\u0670\u0670\u0627\u064E\u0649\u0651\u064F\u0647\u064E\u0627 \u0671\u0644\u0646\u0651\u064E\u0627\u0633\u064F \u0625\u0650\u0646\u0651\u064E\u0627 \u062E\u064E\u0644\u064E\u0642\u0652\u0646\u0670\u0670\u0643\u064F\u0645\u0652 \u0645\u0650\u0646 \u0630\u064E\u0643\u064E\u0631\u064D \u0648\u064E\u0623\u064F\u0646\u062B\u0670\u0649",
      arti: "Wahai manusia, sesungguhnya Kami telah menciptakan kamu dari seorang laki-laki dan perempuan, dan menjadikan kamu berbangsa-bangsa dan bersuku-suku agar kamu saling mengenal.",
    },
    dimensi: [
      { nomor: 1, judul: "Konsep Tasamuh dalam Islam", deskripsi: "Toleransi adalah sikap saling menghormati dan menghargai perbedaan tanpa mengorbankan akidah dan keyakinan." },
      { nomor: 2, judul: "Prinsip Toleransi", deskripsi: "Toleransi dalam Islam memiliki batasan yang jelas: tidak boleh menyangkut akidah, peribadatan, dan identitas agama." },
      { nomor: 3, judul: "Hikmah Toleransi", deskripsi: "Toleransi menciptakan perdamaian, kerukunan, dan persaudaraan dalam kehidupan bermasyarakat yang beragam." },
    ],
    poinPenting: [
      "Toleransi (tasamuh) adalah sikap saling menghormati keyakinan orang lain.",
      "QS. Al-Hujurat [49]: 13 menegaskan kesetaraan manusia di sisi Allah.",
      "Akidah dan ibadah adalah batasan toleransi yang tidak boleh dilanggar.",
      "Rasulullah mencontohkan toleransi dalam Piagam Madinah.",
    ],
  },

  "moderasi-beragama": {
    slug: "moderasi-beragama",
    title: "Moderasi Beragama",
    kelas: 8,
    bab: 5,
    babLabel: "AKHLAK",
    ringkasan: "Menerapkan sikap moderat dalam beragama sebagai wujud Islam rahmatan lil alamin.",
    subTopik: 5,
    waktuBaca: "5 MIN BACA",
    icon: "\u2696\uFE0F",
    videoUrl: "https://www.youtube.com/embed/gI5cfO3yVOw",
    soalUrl: "/pdf/moderasi-beragama-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/moderasi-beragama",
    prevSlug: "membangun-toleransi",
    prevTitle: "Membangun Toleransi",
    pendahuluan: "Moderasi beragama (wasatiah) adalah sikap tengah dalam beragama, tidak ekstrem kiri maupun kanan. Islam adalah agama wasatiah yang mengajarkan keseimbangan antara kehidupan dunia dan akhirat. Umat Islam disebut ummatan wasathan, umat pilihan yang adil dan menjadi saksi bagi umat manusia.",
    konten: [
      {
        judul: "Kandungan QS. Al-Baqarah [2] Ayat 143",
        isi: "Umat Islam adalah ummatan wasathan, umat yang mendapat petunjuk dari Allah sehingga menjadi umat yang adil serta pilihan. Umat Islam harus senantiasa menegakkan keadilan dan kebenaran serta membela yang hak dan melenyapkan yang batil. Mereka dalam segala persoalan hidup berada di tengah antara orang yang mementingkan kebendaan semata dan orang yang hanya mementingkan ukhrawi. Perubahan kiblat dari Baitulmakdis ke Ka'bah adalah untuk menguji keimanan manusia. Allah tidak akan menyia-nyiakan iman dan amal orang yang mematuhi Rasul.",
      },
      {
        judul: "Pengertian Moderasi Beragama",
        isi: "Moderasi beragama adalah konsep yang menekankan sikap saling menghormati dan toleransi di antara kelompok agama yang berbeda. Menurut Quraish Shihab, wasatiah adalah keseimbangan dalam segala persoalan hidup duniawi maupun ukhrawi. Islam mengajarkan umatnya agar meraih materi yang bersifat duniawi tetapi dengan nilai-nilai samawi. Manusia tidak boleh tenggelam dalam materialisme, tidak juga terbang tinggi dalam spiritualisme. Ketika pandangan mengarah ke langit, kaki harus tetap berpijak di bumi.",
      },
      {
        judul: "Ciri-Ciri Moderasi Beragama",
        isi: "Tiga hal utama yang merupakan syarat menjadi umat terbaik menurut QS. Ali Imran: 110: (1) Amar makruf \u2014 menyeru kepada kebajikan. (2) Nahi munkar \u2014 mencegah kemungkaran. (3) Beriman kepada Allah. Umat yang moderat adalah umat yang mengajak kepada kebaikan, memiliki pengetahuan yang luas, dan mampu mengamalkannya secara berulang-ulang dalam kehidupan sehari-hari.",
      },
      {
        judul: "Aplikasi Moderasi dalam Kehidupan",
        isi: "Lima cara mengaplikasikan moderasi beragama: (1) Menghargai perbedaan \u2014 tidak merendahkan atau mengolok-olok agama orang lain. (2) Meningkatkan pemahaman \u2014 membaca literatur agama dan mengikuti dialog antaragama. (3) Mempraktikkan nilai-nilai agama \u2014 kejujuran, kasih sayang, dan perdamaian. (4) Menciptakan dialog \u2014 mendengarkan dan memahami pandangan orang lain. (5) Menjaga sikap tenang dan tidak mudah terprovokasi dalam situasi yang berpotensi konflik.",
      },
    ],
    dalil: {
      surah: "QS. Al-Baqarah [2]: 143",
      arab: "\u0648\u064E\u0643\u064E\u0630\u0670\u0670\u0644\u0650\u0643\u064E \u062C\u064E\u0639\u064E\u0644\u0652\u0646\u0670\u0670\u0643\u064F\u0645\u0652 \u0623\u064F\u0645\u0651\u064E\u0629\u064B \u0648\u064E\u0633\u064E\u0637\u064B\u0627",
      arti: "Dan demikian pula Kami menjadikan kamu (umat Islam) sebagai umat pertengahan (adil dan pilihan).",
    },
    dimensi: [
      { nomor: 1, judul: "Ummatan Wasathan", deskripsi: "Umat Islam adalah umat pertengahan yang adil dan pilihan, menjadi saksi atas seluruh umat manusia dengan sikap moderat." },
      { nomor: 2, judul: "Keseimbangan Dunia dan Akhirat", deskripsi: "Moderasi mengajarkan keseimbangan antara urusan dunia dan akhirat, tidak ekstrem dalam salah satu sisi." },
      { nomor: 3, judul: "Praktik Moderasi dalam Kehidupan", deskripsi: "Sikap moderat diwujudkan melalui amar makruf, nahi munkar, menghargai perbedaan, dan dialog antaragama." },
    ],
    poinPenting: [
      "Umat Islam adalah ummatan wasathan, umat pertengahan yang adil dan pilihan.",
      "Moderasi beragama adalah keseimbangan dalam segala persoalan hidup.",
      "Tiga syarat umat terbaik: amar makruf, nahi munkar, dan beriman kepada Allah.",
      "Sikap moderat mencegah ekstremisme dan radikalisme dalam beragama.",
    ],
  },

  "adab-dalam-islam": {
    slug: "adab-dalam-islam",
    title: "Adab dalam Islam",
    kelas: 9,
    bab: 1,
    babLabel: "AKHLAK",
    ringkasan: "Menerapkan adab-adab mulia dalam pergaulan sehari-hari sesuai tuntunan Islam.",
    subTopik: 10,
    waktuBaca: "6 MIN BACA",
    icon: "\uD83C\uDF3F",
    soalUrl: "/pdf/adab-dalam-islam-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/adab-dalam-islamm",
    pendahuluan: "Adab adalah inti dari akhlak Islam. Rasulullah SAW diutus untuk menyempurnakan akhlak mulia. Adab bukan sekadar sopan santun, tetapi cerminan keimanan seorang muslim dalam berinteraksi dengan Allah, sesama manusia, dan lingkungan.",
    konten: [
      {
        judul: "Pengertian Adab",
        isi: "Adab secara etimologi berarti kehalusan budi pekerti dan kesopanan. Secara terminologi, adab adalah ilmu tentang tujuan mencari pengetahuan. Adab adalah kebaikan manusia seperti kerendahan hati, sikap yang baik, kesederhanaan, kontrol diri, amanah, dan terbebas dari iri hati. Nabi Muhammad SAW bersabda: 'Sesungguhnya aku diutus untuk menyempurnakan akhlak mulia.'",
      },
      {
        judul: "Adab terhadap Orang yang Lebih Tua",
        isi: "Tujuh adab terhadap orang yang lebih tua: (1) Mendahulukan yang lebih tua. (2) Tidak berbicara mendahului mereka. (3) Berbicara dengan lemah lembut. (4) Mendengarkan nasihat dengan baik. (5) Menyenangkan hati orang tua. (6) Mengucapkan salam. (7) Berbicara dengan sopan.",
      },
      {
        judul: "Adab terhadap Teman Sebaya",
        isi: "Sepuluh adab terhadap teman sebaya: memilih teman yang baik, mengucapkan salam, mencintai teman karena Allah, bersikap sopan, menolong dan ramah, tidak menyepelekan teman, menghargai perasaan orang lain, menyesuaikan diri tanpa kehilangan kepribadian, berkata terus terang namun sopan, dan tidak menonjolkan diri secara berlebihan.",
      },
      {
        judul: "Adab terhadap Orang yang Lebih Muda dan Lawan Jenis",
        isi: "Adab terhadap yang lebih muda: menolong bila kesulitan, bersabar, berbicara sopan, memberi kasih sayang dan bimbingan, memberi contoh dengan perbuatan. Adab terhadap lawan jenis: menundukkan pandangan, tidak bersentuhan, tidak khalwat (berdua-duaan), tidak bercampur-baur yang memudahkan bersentuhan, dan menjaga interaksi sesuai syariat.",
      },
      {
        judul: "Adab dalam Berkomunikasi",
        isi: "Enam etika komunikasi dalam Islam: (1) Qawlan sadidan \u2014 perkataan benar, lurus, jujur. (2) Qawlan baligha \u2014 efektif, tepat sasaran. (3) Qawlan karimah \u2014 perkataan mulia. (4) Qawlan ma'rufan \u2014 perkataan baik, pantas. (5) Qawlan layyina \u2014 perkataan lemah lembut. (6) Qawlan maisura \u2014 mudah diterima.",
      },
    ],
    dalil: {
      surah: "QS. Al-Qalam [68]: 4",
      arab: "\u06D6\u0648\u064E\u0625\u0650\u0646\u0651\u064E\u0643\u064E \u0644\u064E\u0639\u064E\u0644\u064E\u0649\u0670 \u062E\u064F\u0644\u064F\u0642\u064D \u0639\u064E\u0638\u0650\u064A\u0645\u064D",
      arti: "Dan sesungguhnya engkau (Muhammad) benar-benar berbudi pekerti yang agung.",
    },
    dimensi: [
      { nomor: 1, judul: "Adab kepada Allah", deskripsi: "Mengagungkan Allah dengan menjalankan perintah dan menjauhi larangan-Nya, serta beribadah dengan ikhlas." },
      { nomor: 2, judul: "Adab kepada Sesama Manusia", deskripsi: "Berinteraksi dengan sopan santun kepada orang tua, guru, teman sebaya, yang lebih muda, dan lawan jenis sesuai tuntunan Islam." },
      { nomor: 3, judul: "Adab dalam Komunikasi", deskripsi: "Menjaga ucapan dengan enam prinsip qawlan (sadid, baligh, karim, ma'ruf, layyin, maisur) agar komunikasi membawa kebaikan." },
    ],
    poinPenting: [
      "Adab adalah cermin keimanan seorang muslim.",
      "Rasulullah SAW diutus untuk menyempurnakan akhlak mulia.",
      "Enam etika komunikasi dalam Islam dimulai dengan qawlan sadidan.",
    ],
    nextSlug: "beriman-kepada-hari-akhir",
    nextTitle: "Beriman kepada Hari Akhir",
  },

  "beriman-kepada-hari-akhir": {
    slug: "beriman-kepada-hari-akhir",
    title: "Beriman kepada Hari Akhir",
    kelas: 9,
    bab: 2,
    babLabel: "AKIDAH",
    ringkasan: "Memahami tanda-tanda dan peristiwa hari akhir sebagai penguat iman.",
    subTopik: 7,
    waktuBaca: "6 MIN BACA",
    icon: "\u2600\uFE0F",
    videoUrl: "https://www.youtube.com/embed/S4UDs5v8uzI",
    soalUrl: "/pdf/beriman-kepada-hari-akhir-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/aplikasi-tanpa-judul",
    pendahuluan: "Iman kepada hari akhir adalah rukun iman kelima. Percaya dengan sepenuh hati bahwa alam semesta dan seisinya akan hancur dan berakhir. Kehidupan dunia hanya sementara, sedangkan kehidupan di akhirat adalah yang kekal. Keimanan ini mendorong seseorang untuk rajin beribadah dan selalu berbuat kebaikan.",
    konten: [
      {
        judul: "Pengertian Iman kepada Hari Akhir",
        isi: "Iman kepada hari akhir adalah rukun iman kelima. Beriman kepada hari akhir berarti percaya bahwa alam semesta akan hancur dan berakhir, dan setelah itu manusia akan dibangkitkan kembali untuk mempertanggungjawabkan amal perbuatannya. Kehidupan dunia hanya sementara, kehidupan akhirat yang kekal abadi.",
      },
      {
        judul: "Kiamat Sugra dan Kubra",
        isi: "Kiamat Sugra (kecil): kehancuran sebagian alam semesta, seperti kematian seseorang, tsunami, gempa bumi, longsor, banjir, dan angin topan. Kiamat Kubra (besar): kehancuran seluruh alam semesta yang dimulai dengan tiupan sangkakala Malaikat Israfil. Tanda-tanda kiamat kubra: matahari terbit dari barat, munculnya Dajjal, Yakjuj dan Makjuj, turunnya Nabi Isa a.s.",
      },
      {
        judul: "Tahapan Setelah Kematian",
        isi: "Enam tahapan: (1) Yaumul Barzakh \u2014 alam kubur, ditanyai Malaikat Munkar dan Nakir. (2) Yaumul Ba'si \u2014 hari kebangkitan, Israfil meniup sangkakala kedua. (3) Yaumul Mahsyar \u2014 dikumpulkan di padang Mahsyar. (4) Yaumul Hisab \u2014 hari perhitungan, amal diperiksa satu persatu. (5) Yaumul Mizan \u2014 hari penimbangan amal dengan timbangan yang adil. (6) Yaumul Jaza \u2014 hari pembalasan, surga bagi yang baik dan neraka bagi yang buruk.",
      },
      {
        judul: "Perilaku yang Mencerminkan Iman",
        isi: "Tujuh perilaku: (1) Menjaga pikiran dan sikap dari akhlak tercela. (2) Meningkatkan iman dan takwa. (3) Memperbanyak zikir dan shalawat. (4) Membaca dan mengkaji Al-Qur'an. (5) Bergaul dengan orang shalih. (6) Mengembangkan potensi diri. (7) Memupuk silaturahmi.",
      },
    ],
    dalil: {
      surah: "QS. Al-Hajj [22]: 7",
      arab: "\u06D6\u0648\u064E\u0623\u064E\u0646\u0651\u064E \u0671\u0644\u0633\u0651\u064E\u0627\u0639\u064E\u0629\u064E \u0621\u064E\u0627\u062A\u0650\u064A\u064E\u0629\u064C \u0644\u0651\u064E\u0627 \u0631\u064E\u064A\u0652\u0628\u064E \u0641\u0650\u064A\u0647\u064E\u0627",
      arti: "Dan sungguh, hari Kiamat itu pasti datang, tidak ada keraguan padanya.",
    },
    dimensi: [
      { nomor: 1, judul: "Meyakini Kedatangan Hari Akhir", deskripsi: "Percaya sepenuh hati bahwa hari kiamat pasti datang dan kehidupan dunia hanyalah sementara." },
      { nomor: 2, judul: "Memahami Tahapan Kehidupan Akhirat", deskripsi: "Mengetahui enam tahapan setelah kematian: barzakh, ba'si, mahsyar, hisab, mizan, dan jaza." },
      { nomor: 3, judul: "Mempersiapkan Bekal untuk Akhirat", deskripsi: "Meningkatkan iman, memperbanyak ibadah, berbuat baik, dan menjauhi larangan Allah sebagai bekal menghadapi hari pembalasan." },
    ],
    poinPenting: [
      "Kiamat sugra adalah kiamat kecil (kematian, bencana); kiamat kubra adalah kiamat besar.",
      "Enam tahapan setelah kematian: Barzakh, Ba'si, Mahsyar, Hisab, Mizan, Jaza.",
      "Iman kepada hari akhir mendorong perbaikan diri dan amal saleh.",
    ],
    prevSlug: "adab-dalam-islam",
    prevTitle: "Adab dalam Islam",
    nextSlug: "beriman-kepada-qada-dan-qadar",
    nextTitle: "Beriman kepada Qada dan Qadar",
  },

  "beriman-kepada-qada-dan-qadar": {
    slug: "beriman-kepada-qada-dan-qadar",
    title: "Beriman kepada Qada dan Qadar",
    kelas: 9,
    bab: 3,
    babLabel: "AKIDAH",
    ringkasan: "Meyakini takdir Allah sebagai motivasi untuk terus berusaha dan berdoa.",
    subTopik: 5,
    waktuBaca: "5 MIN BACA",
    icon: "\u2728",
    videoUrl: "https://www.youtube.com/embed/j-M4Q08tFtw",
    soalUrl: "/pdf/beriman-kepada-qada-dan-qadar-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-qada-dan-qadar",
    pendahuluan: "Iman kepada qada dan qadar adalah rukun iman keenam. Qada adalah ketetapan Allah di Lauhulmahfuz sejak zaman azali, sedangkan qadar adalah perwujudan ketetapan tersebut. Beriman kepada takdir tidak boleh menjadikan seseorang pasif, justru harus semakin giat berusaha, berdoa, dan bertawakal.",
    konten: [
      {
        judul: "Pengertian Qada dan Qadar",
        isi: "Qada adalah ketetapan Allah yang tercatat di Lauhulmahfuz sejak zaman azali (sebelum alam semesta diciptakan). Qadar adalah perwujudan ketetapan Allah dalam ukuran dan bentuk yang telah ditentukan. Iman kepada qada dan qadar berarti mempercayai segala ketentuan hidup yang telah digariskan Allah bagi setiap makhluk-Nya.",
      },
      {
        judul: "Takdir Mubram",
        isi: "Takdir Mubram adalah takdir yang terjadi pada diri manusia dan tidak dapat diusahakan atau diubah. Contoh: jenis kelamin, ciri-ciri fisik, ajal, dan rezeki yang sudah ditetapkan. Empat perkara yang ditulis Malaikat saat peniupan ruh (usia 120 hari): ilmu/perbuatan, rezeki, umur, dan nasib surga/neraka.",
      },
      {
        judul: "Takdir Mualak",
        isi: "Takdir Mualak adalah takdir yang masih dapat diubah melalui usaha dan ikhtiar manusia. 'Mualak' berarti sesuatu yang digantungkan \u2014 mengikutsertakan peran manusia. Contoh: kesehatan \u2014 sakit bisa sembuh dengan berobat, kepandaian \u2014 dengan belajar tekun, kekayaan \u2014 dengan kerja keras, keberhasilan dan kesuksesan. Takdir bisa berubah karena doa dan perbuatan baik seperti silaturahmi, berbakti pada orang tua, dan menyantuni yatim.",
      },
      {
        judul: "Kaitan Takdir, Ikhtiar, dan Tawakal",
        isi: "Ikhtiar adalah usaha sungguh-sungguh. Doa adalah komunikasi dengan Allah. Tawakal adalah melepaskan diri dari ketergantungan selain Allah setelah berusaha maksimal. Manusia berusaha, berdoa, lalu menyerahkan hasil akhir kepada Allah. Lima perilaku yang mencerminkan iman kepada qada dan qadar: ikhtiar, tawakal, syukur, takwa, qanaah, dan sabar.",
      },
    ],
    dalil: {
      surah: "QS. At-Taubah [9]: 51",
      arab: "\u06D6\u0642\u064F\u0644 \u0644\u0651\u064E\u0646 \u064A\u064F\u0635\u0650\u064A\u0628\u064E\u0646\u064E\u0627 \u0625\u0650\u0644\u0651\u064E\u0627 \u0645\u064E\u0627 \u0643\u064E\u062A\u064E\u0628\u064E \u0671\u0644\u0644\u0651\u064E\u0647\u064F \u0644\u064E\u0646\u064E\u0627",
      arti: "Katakanlah: 'Tidak akan menimpa kami sesuatu pun melainkan apa yang telah ditetapkan Allah bagi kami.'",
    },
    dimensi: [
      { nomor: 1, judul: "Memahami Qada dan Qadar", deskripsi: "Meyakini bahwa segala ketentuan hidup telah ditetapkan Allah sejak azali dan diwujudkan sesuai kehendak-Nya." },
      { nomor: 2, judul: "Membedakan Takdir Mubram dan Mualak", deskripsi: "Mengetahui mana takdir yang tidak bisa diubah (mubram) dan mana yang bisa diubah dengan ikhtiar (mualak)." },
      { nomor: 3, judul: "Mengoptimalkan Ikhtiar, Doa, dan Tawakal", deskripsi: "Berusaha maksimal, berdoa dengan sungguh-sungguh, lalu berserah diri kepada Allah atas hasil akhirnya." },
    ],
    poinPenting: [
      "Qada = ketetapan Allah di Lauhulmahfuz; Qadar = perwujudan ketetapan.",
      "Takdir mubram tidak bisa diubah; takdir mualak bisa diubah dengan ikhtiar.",
      "Iman kepada takdir mendorong ikhtiar, bukan pasrah tanpa usaha.",
    ],
    nextSlug: "semangat-mencari-ilmu",
    nextTitle: "Semangat Mencari Ilmu",
    prevSlug: "beriman-kepada-hari-akhir",
    prevTitle: "Beriman kepada Hari Akhir",
  },

  "semangat-mencari-ilmu": {
    slug: "semangat-mencari-ilmu",
    title: "Semangat Mencari Ilmu",
    kelas: 9,
    bab: 4,
    babLabel: "AKHLAK",
    ringkasan: "Menumbuhkan semangat mencari ilmu sebagai kewajiban setiap muslim.",
    subTopik: 5,
    waktuBaca: "5 MIN BACA",
    icon: "\uD83D\uDCDA",
    videoUrl: "https://www.youtube.com/embed/MmRnGxByoUQ",
    soalUrl: "/pdf/semangat-mencari-ilmu-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/semangat-mencari-ilmu",
    nextSlug: "manusia-khalifah-di-muka-bumi",
    nextTitle: "Manusia sebagai Khalifah",
    prevSlug: "beriman-kepada-qada-dan-qadar",
    prevTitle: "Beriman kepada Qada & Qadar",
    pendahuluan: "Mencari ilmu adalah kewajiban setiap muslim. Islam menjanjikan derajat yang tinggi bagi orang-orang yang beriman dan berilmu. Dalam Al-Qur'an, Allah memerintahkan hamba-Nya untuk senantiasa mencari ilmu dan mengamalkannya dalam kehidupan sehari-hari.",
    konten: [
      {
        judul: "Kandungan Surah Al-Mujadalah [58] Ayat 11",
        isi: "Ayat ini memberikan penjelasan tentang adab dalam majelis dan keutamaan orang berilmu. Para sahabat berlomba-lomba mencari tempat dekat Rasulullah untuk mendengar perkataan beliau. Orang yang memberikan kelapangan kepada sesama muslim, maka Allah akan memberi kelapangan pula di dunia dan akhirat. Allah akan mengangkat derajat orang yang beriman dan berilmu. Orang yang mempunyai derajat tertinggi di sisi Allah adalah yang beriman dan berilmu serta mengamalkannya.",
      },
      {
        judul: "Kandungan Surah Az-Zumar [39] Ayat 9",
        isi: "Ayat ini menanyakan apakah sama orang-orang yang mengetahui dengan orang-orang yang tidak mengetahui. Orang yang mengetahui pahala dan siksa akan berbeda dengan yang tidak mengetahuinya. Hanya orang-orang yang berakal (ulul albab) yang dapat mengambil pelajaran dari tanda-tanda kebesaran Allah. Ulul albab adalah orang yang senantiasa mengingat Allah dan kebesaran-Nya, memiliki kemampuan berpikir kritis, dan gemar berliterasi.",
      },
      {
        judul: "Keutamaan Ilmu dan Orang yang Mencari Ilmu",
        isi: "Ilmu pengetahuan memiliki peran besar dalam kehidupan. Dengan ilmu, manusia dapat membedakan antara benar dan salah. Ilmu membantu manusia memahami kewajibannya untuk bertakwa kepada Allah. Allah akan mengangkat derajat manusia yang berilmu di dunia dan akhirat. Rasulullah bersabda: 'Barang siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan baginya jalan menuju surga.' (HR. Muslim). Menuntut ilmu adalah kewajiban setiap muslim dari buaian hingga liang lahat.",
      },
      {
        judul: "Adab-Adab Menuntut Ilmu",
        isi: "Enam adab menuntut ilmu: (1) Niat karena Allah \u2014 menuntut ilmu dengan ikhlas agar ilmu bermanfaat. (2) Selalu berdoa \u2014 'Ya Allah, berikanlah manfaat atas ilmu yang Engkau ajarkan, ajarilah aku hal bermanfaat, dan tambahkanlah ilmu.' (3) Bersungguh-sungguh \u2014 antusias dan tidak pernah merasa puas dengan ilmu yang didapat. (4) Menjauhi maksiat \u2014 maksiat membuat sulit berkonsentrasi dan ilmu sulit dipahami. (5) Jangan sombong \u2014 rendah hati adalah kunci mendapatkan ilmu bermanfaat. (6) Memperhatikan guru \u2014 menyimak ajaran guru dengan baik sebagai bentuk adab.",
      },
    ],
    dalil: {
      surah: "QS. Al-Mujadalah [58]: 11",
      arab: "\u064A\u0670\u0670\u0670\u064E\u0649\u0651\u064F\u0647\u064E\u0627 \u0671\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0621\u064E\u0627\u0645\u064E\u0646\u064F\u0648\u0627\u0652 \u0625\u0650\u0630\u064E\u0627 \u0642\u0650\u064A\u0644\u064E \u0644\u064E\u0643\u064F\u0645\u0652 \u062A\u064E\u0641\u064E\u0633\u0651\u064E\u062D\u064F\u0648\u0627\u0652 \u0641\u0650\u064A \u0671\u0644\u0652\u0645\u064E\u062C\u0670\u0670\u0644\u0650\u0633\u0650",
      arti: "Wahai orang-orang yang beriman, apabila dikatakan kepadamu 'Berilah kelapangan di dalam majelis-majelis,' maka lapangkanlah, niscaya Allah akan memberi kelapangan untukmu.",
    },
    dimensi: [
      { nomor: 1, judul: "Iman dan Ilmu", deskripsi: "Orang yang beriman dan berilmu memiliki derajat tertinggi di sisi Allah. Ilmu tanpa iman akan menyesatkan, iman tanpa ilmu akan lemah." },
      { nomor: 2, judul: "Ulul Albab", deskripsi: "Ulul albab adalah orang berakal yang mampu mengambil pelajaran dari tanda-tanda kebesaran Allah dan gemar berliterasi." },
      { nomor: 3, judul: "Semangat Mencari Ilmu", deskripsi: "Menuntut ilmu adalah kewajiban setiap muslim sepanjang hayat. Allah memudahkan jalan surga bagi penuntut ilmu." },
    ],
    poinPenting: [
      "QS. Al-Mujadalah [58]: 11 menjelaskan bahwa Allah mengangkat derajat orang berilmu.",
      "QS. Az-Zumar [39]: 9 menjelaskan bahwa tidak sama orang berilmu dengan yang tidak.",
      "Rasulullah bersabda bahwa siapa yang menempuh jalan mencari ilmu, Allah mudahkan jalannya ke surga.",
      "Ada enam adab menuntut ilmu: niat ikhlas, berdoa, sungguh-sungguh, jauhi maksiat, rendah hati, dan hormati guru.",
    ],
  },

  "manusia-khalifah-di-muka-bumi": {
    slug: "manusia-khalifah-di-muka-bumi",
    title: "Manusia sebagai Khalifah di Muka Bumi",
    kelas: 9,
    bab: 5,
    babLabel: "AKIDAH",
    ringkasan: "Memahami peran dan tanggung jawab manusia sebagai khalifah di muka bumi.",
    subTopik: 5,
    waktuBaca: "5 MIN BACA",
    icon: "\uD83C\uDF0D",
    videoUrl: "https://www.youtube.com/embed/7RqFgDfP7J0",
    soalUrl: "/pdf/manusia-khalifah-di-muka-bumi-soal.pdf",
    gameUrl: "https://kuis-bangun-ruang9.my.canva.site/manusia-sebagai-khalifah-di-bumi",
    prevSlug: "semangat-mencari-ilmu",
    prevTitle: "Semangat Mencari Ilmu",
    pendahuluan: "Manusia diciptakan Allah sebagai khalifah di muka bumi untuk mengelola dan memakmurkan alam. Tugas sebagai khalifah adalah amanah yang akan dimintai pertanggungjawaban di hadapan Allah. Manusia dibekali akal dan ilmu untuk menjalankan tugas mulia ini.",
    konten: [
      {
        judul: "Kandungan Surah Al-Baqarah [2] Ayat 30",
        isi: "Ayat ini adalah pemberitahuan Allah kepada malaikat bahwa Dia akan menciptakan manusia sebagai khalifah di muka bumi. Malaikat meragukan kemampuan manusia karena memiliki sifat merusak dan menumpahkan darah. Allah menjawab bahwa hanya Dialah yang mengetahui alasannya. Manusia sebagai khalifah dibekali akal dan diajarkan berbagai ilmu pengetahuan. Setiap manusia adalah pemimpin dan akan ditanya mengenai pertanggungjawabannya (HR. Bukhari).",
      },
      {
        judul: "Kandungan Surah Al-Qasas [28] Ayat 77",
        isi: "Ayat ini mengajarkan keseimbangan hidup dunia dan akhirat. Manusia tidak boleh hanya mementingkan dunia dan melupakan akhirat, begitu pula sebaliknya. Lima hal pokok dalam ayat ini: (1) Perintah mencari kebahagiaan dunia akhirat. (2) Larangan melupakan kenikmatan dunia. (3) Perintah berbuat baik kepada orang lain. (4) Larangan berbuat kerusakan di bumi. (5) Allah tidak menyukai orang yang berbuat kerusakan. Ayat ini juga merupakan nasihat kepada Qarun yang serakah.",
      },
      {
        judul: "Fungsi dan Kedudukan Manusia sebagai Khalifah",
        isi: "Fungsi manusia di dunia adalah sebagai khalifah, tujuan penciptaannya adalah untuk beribadah kepada Allah, dan tujuan hidupnya adalah mendapatkan kesenangan dunia serta ketenangan akhirat. Khalifah adalah seseorang yang diberi tugas sebagai pelaksana tugas-tugas yang telah ditentukan Allah. Jabatan manusia sebagai khalifah adalah amanat Allah. Manusia memiliki keistimewaan dibanding makhluk lain dari segi fisik dan personalitas karakter. Sebagai khalifatullah, manusia harus bertindak sebagaimana Allah bertindak kepada semua makhluk-Nya.",
      },
      {
        judul: "Perilaku Pengamalan Ayat",
        isi: "Perilaku yang mencerminkan QS. Al-Baqarah [2]: 30: (1) Menjalankan tugas sebagai khalifah dengan menjaga dan melestarikan bumi. (2) Tidak berbuat kerusakan di muka bumi. (3) Membuang sampah pada tempatnya. (4) Tidak berbuat syirik. (5) Menjalankan perintah Allah dan menjauhi larangan-Nya. Perilaku yang mencerminkan QS. Al-Qasas [28]: 77: (1) Hidup seimbang dengan mengutamakan kebahagiaan akhirat. (2) Menikmati kehidupan dunia sesuai ridha Allah. (3) Tidak hidup serakah seperti Qarun. (4) Tidak sibuk mengejar harta sehingga lupa akhirat. Hadis tentang kasih sayang: 'Sayangilah penduduk yang ada di bumi, niscaya akan disayangi penduduk langit.' (HR. Tirmizi).",
      },
    ],
    dalil: {
      surah: "QS. Al-Baqarah [2]: 30",
      arab: "\u0648\u064E\u0625\u0650\u0630\u0652 \u0642\u064E\u0627\u0644\u064E \u0631\u064E\u0628\u0651\u064F\u0643\u064E \u0644\u0650\u0644\u0652\u0645\u064E\u0644\u064E\u0670\u0670\u0626\u0650\u0643\u064E\u0629\u0650 \u0625\u0650\u0646\u0651\u0650\u064A \u062C\u064E\u0627\u0639\u0650\u0644\u064C \u0641\u0650\u064A \u0671\u0644\u0623\u064E\u0631\u0652\u0636\u0650 \u062E\u064E\u0644\u0650\u064A\u0641\u064E\u0629\u064B",
      arti: "Ingatlah ketika Tuhanmu berfirman kepada para malaikat: 'Sesungguhnya Aku hendak menjadikan seorang khalifah di bumi.'",
    },
    dimensi: [
      { nomor: 1, judul: "Konsep Khalifah di Bumi", deskripsi: "Manusia sebagai khalifah bertugas mengelola dan memakmurkan bumi, menjaga kelestarian alam, dan melaksanakan perintah Allah." },
      { nomor: 2, judul: "Keseimbangan Dunia dan Akhirat", deskripsi: "Manusia harus menjaga keseimbangan antara kepentingan dunia dan akhirat, tidak boleh tenggelam dalam materialisme atau spiritualisme semata." },
      { nomor: 3, judul: "Kasih Sayang sebagai Khalifah", deskripsi: "Sebagai khalifah, manusia harus menebarkan kebaikan dan kasih sayang kepada seluruh makhluk di bumi." },
    ],
    poinPenting: [
      "Manusia adalah khalifah di bumi yang bertanggung jawab memakmurkan dan menjaganya.",
      "QS. Al-Baqarah [2]: 30 menegaskan penciptaan manusia sebagai khalifah.",
      "QS. Al-Qasas [28]: 77 mengajarkan keseimbangan hidup dunia dan akhirat.",
      '"Sayangilah penduduk bumi, niscaya akan disayangi penduduk langit." (HR. Tirmizi)',
    ],
  },
};
