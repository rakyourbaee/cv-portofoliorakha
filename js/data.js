/*
  DATA PRIBADI — edit file ini untuk memasukkan informasi Anda.
  Semua bagian website dirender dari objek di bawah ini.
*/
window.PORTFOLIO_DATA = {
  config: {
    // Isi dengan URL endpoint layanan form (misalnya Formspree). Kosongkan jika belum ada.
    formEndpoint: "",
    // Path foto profil. Kosongkan untuk memakai inisial.
    photo: "assets/foto.png",
    // Path file CV PDF yang dipakai tombol "Unduh CV".
    cvFile: "assets/cv.pdf"
  },

  profile: {
    name: "Rakha Damar Bagaskara",
    role: "Mahasiswa Sistem Informasi",
    intro: "Mahasiswa semester 5 Sistem Informasi S1 di Universitas Gunadarma, dengan pengalaman di bidang jaringan, F&B, dan IT.",
    about: [
      "Halo! Saya Rakha Damar Bagaskara, mahasiswa semester 5 Sistem Informasi S1 di Universitas Gunadarma.",
      "Saya memiliki pengalaman di bidang jaringan, F&B, dan IT. Saya menguasai Bahasa Inggris formal untuk kebutuhan sehari-hari, serta beberapa bahasa pemrograman seperti HTML, CSS, Python, dan C. Saya juga terbiasa memakai aplikasi Microsoft Office."
    ],
    location: "Bogor, Jawa Barat, Indonesia",
    goal: "Mencari kesempatan magang dan pekerjaan di bidang IT dan jaringan. Saya selalu ingin tahu dan terus belajar di mana pun saya berada, agar bisa berkembang dan memberi kontribusi nyata.",
    interests: ["Jaringan & fiber optic", "IT", "Pemrograman web", "Layanan F&B"],
    email: "rakhabagasdamar@gmail.com",
    phone: "089682327343",
    linkedin: "https://www.linkedin.com/in/rakha-damar-bagaskara-225188248",
    instagram: "https://www.instagram.com/rraakhaa_/"
  },

  skillGroups: [
    { category: "Pemrograman", items: ["HTML", "CSS", "Python", "C"] },
    { category: "Jaringan & Infrastruktur", items: ["Fiber optic", "Instalasi jaringan", "Konfigurasi jaringan", "Administrasi server"] },
    { category: "Perkantoran", items: ["Microsoft Office"] },
    { category: "Bahasa", items: ["Bahasa Inggris formal"] },
    { category: "Layanan & Hospitality", items: ["Food & beverage service", "Front office", "Food preparation", "Body language", "Verbal etiquette", "Service etiquette"] },
    { category: "Soft Skills", items: ["Work ethic", "Communication", "Teamwork", "Problem solving", "Time management", "Adaptability"] }
  ],

  education: [
    {
      institution: "Universitas Gunadarma",
      major: "Sistem Informasi (S1)",
      period: "Sekarang — Semester 5",
      note: "",
      courses: []
    },
    {
      institution: "SMK Negeri 3 Kota Bogor",
      major: "Teknik Komputer dan Jaringan (TKJ)",
      period: "2021 — 2024",
      note: "Pernah PKL selama 6 bulan di PT. Powertelecom Indonesia.",
      courses: []
    },
    {
      institution: "SMP Negeri 5 Kota Bogor",
      major: "Sekolah Menengah Pertama",
      period: "2018 — 2021",
      note: "Pernah mengikuti lomba sains club antar sekolah dan aktif di OSIS selama 1 tahun. Sempat masuk peringkat di kelas 7 dan 8.",
      courses: []
    },
    {
      institution: "Madrasah Ibtidaiyah Manbaul Islam",
      major: "Sekolah Dasar",
      period: "2011 — 2018",
      note: "Selalu masuk peringkat 3 besar di kelas dari kelas 1 sampai kelas 6.",
      courses: []
    }
  ],

  projects: [],

  experience: [
    {
      role: "Praktik Kerja Lapangan: Teknisi Jaringan dan Admin Server",
      organization: "PT. Powertelecom Indonesia",
      period: "2022 — 2023",
      points: [
        "Bekerja selama 6 bulan sebagai teknisi jaringan dan admin server.",
        "Belajar jaringan fiber optic dan menguasai alat kerja seperti passconn dan fusion splicer.",
        "Melakukan instalasi, perancangan, dan konfigurasi jaringan di beberapa instansi besar, seperti Red Doorz dan Lake Resort MNC."
      ]
    },
    {
      role: "Part-time di Bagian Service, Kitchen, dan Front Office",
      organization: "Hotel",
      period: "2024",
      points: [
        "Bertugas di bagian service dan kitchen.",
        "Pernah belajar sebagai Front Office (FO).",
        "Pernah ditempatkan di cold kitchen dan ditugaskan untuk food preparation, seperti dressing dan portioning.",
        "Belajar manner, body language, verbal etiquette, dan service etiquette."
      ]
    }
  ],

  certifications: [
    {
      title: "Sertifikat Kompetensi Teknik Komputer dan Jaringan (KKNI Level II)",
      issuer: "BNSP melalui LSP P1 SMKN 3 Bogor",
      year: "2024",
      thumb: "assets/sertifikat-kompetensi.jpg",
      link: "assets/sertifikat-kompetensi.jpg"
    },
    {
      title: "Sertifikat Praktik Kerja Industri: Teknik Komputer dan Jaringan (predikat Sangat Baik)",
      issuer: "SMK Negeri 3 Bogor",
      year: "2023",
      thumb: "assets/sertifikat-pkl.jpg",
      link: "assets/sertifikat-pkl.jpg"
    },
    {
      title: "Pemberdayaan Pandu Digital: Pengenalan Lingkungan Sekolah SMKN 3 Bogor 2021/2022",
      issuer: "Pandu Digital Bogor dan SMKN 3 Bogor",
      year: "2021",
      thumb: "assets/sertifikat-thumb.png",
      link: "assets/sertifikat-pandu-digital.pdf"
    }
  ]
};
