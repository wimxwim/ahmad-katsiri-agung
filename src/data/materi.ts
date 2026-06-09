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
    prevSlug: "beriman-kepada-kitab-allah",
    prevTitle: "Beriman kepada Kitab Allah",
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
    prevSlug: "beriman-kepada-hari-akhir",
    prevTitle: "Beriman kepada Hari Akhir",
  },
};
