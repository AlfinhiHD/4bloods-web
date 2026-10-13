export interface StreamerMember {
  name: string;
  channelId: string;
  handle?: string;
  rank: 'OG' | 'Under OG' | 'Young Bloods' | 'Member';
  role: string;
  chapter: string;
  featuredVideoId?: string;
  featuredTitle?: string;
  featuredThumb?: string;
  bio?: string;
}

export interface LoreChapter {
  id: string;
  number: string;
  roman: string;
  title: string;
  subtitle: string;
  era: string;
  turfName: string;
  postalCode: string;
  logoUsed: string;
  logoName: string;
  mapImage: string;
  actionImage: string;
  quote: string;
  summary: string;
  paragraphs: string[];
  milestones: { label: string; detail: string }[];
  colorsRule: string;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'hoodie' | 'workshirt' | 'tee' | 'headwear' | 'bag' | string;
  categoryLabel: string;
  tier: string;
  era: string;
  frontImage: string;
  backImage?: string;
  description: string;
  specs: string[];
  badge?: string;
  badgeVariant?: 'red' | 'orange' | 'cyan' | 'slate';
  price?: string;
  priceNum?: number;
  subtitle?: string;
  tag?: string;
  flipAvailable?: boolean;
  inStock?: boolean;
  authCode?: string;
}

export interface MediaTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  type: 'OFFICIAL MV' | 'OFFICIAL AUDIO' | 'ANTHEM' | 'DISS TRACK';
  target?: string;
  duration: string;
  thumb: string;
  description: string;
}

export interface WarArchive {
  id: string;
  videoId: string;
  title: string;
  streamer: string;
  rank: string;
  category: 'NAHMIER POV' | 'OG SPOTLIGHT' | 'LEAGUE WAR';
  thumb: string;
  tag: string;
}

export const LORE_CHAPTERS: LoreChapter[] = [
  {
    id: 'chapter-1',
    number: '01',
    roman: 'CHAPTER I',
    title: 'BLOOD ON THE WEST SIDE',
    subtitle: 'Kelahiran Identitas Merah & Prinsip Kekeluargaan Jalanan',
    era: 'ERA AWAL // WEST SIDE ORIGIN',
    turfName: 'West Side Projects, Los Santos',
    postalCode: 'WEST SECTOR // LEGACY TURF',
    logoUsed: '/assets/logo_v1.png',
    logoName: '4BS Red Bandana Emblem (First Era)',
    mapImage: '/assets/hood_west.jpg',
    actionImage: '/assets/streams/ilham_back.jpg',
    quote: 'Sebelum nama kami menggema di seluruh penjuru kota, kami hanyalah sekelompok anak jalanan yang menolak tunduk pada hukum siapa pun selain darah.',
    summary:
      '4Bloods lahir di kawasan keras West Side Los Santos dari ikatan persaudaraan para pendiri (Original Gangsters). Merah bukan sekadar warna pakaian, melainkan sumpah kesetiaan seumur hidup.',
    paragraphs: [
      'Berawal dari kerasnya kehidupan di sudut blok West Side Los Santos, 4Bloods terbentuk bukan sebagai organisasi bisnis biasa, melainkan sebagai rumah bagi mereka yang terbuang namun memiliki loyalitas tanpa batas. Di bawah komando para OG pendiri—Ilham Joseph, Louis Ven, Deja Amari, dan Muhammad Sumbul—fondasi 4Bloods dibangun di atas rasa hormat, keberanian, dan solidaritas jalanan.',
      'Pada fase Chapter I ini, identitas visual 4Bloods mulai dikenal luas di seluruh server ImeRP melalui penggunaan bandana merah (4BS) dan aturan berpakaian hitam-merah yang disiplin. Setiap gesekan antar-kelompok di West Side menempa mentalitas tempur anggota 4Bloods hingga disegani lawan maupun kawan.'
    ],
    milestones: [
      { label: 'DEKLARASI 4BS WEST SIDE', detail: 'Penyatuan blok West Side di bawah bendera merah 4Bloods oleh 4 OG utama.' },
      { label: 'KODE ETIK DARAH', detail: 'Penetapan aturan loyalitas: Blood In, Blood Out & larangan keras mengkhianati keluarga.' },
      { label: 'IDENTITAS BANDANA MERAH', detail: 'Peluncuran lambang 4BS Diamond Bandana & seragam jalanan generasi pertama.' }
    ],
    colorsRule: 'Dominan Merah Darah (#DC2626) & Hitam Pekat (#09090B)'
  },
  {
    id: 'chapter-2',
    number: '02',
    roman: 'CHAPTER II',
    title: 'JAMESTOWN STREET & THE EAST',
    subtitle: 'Migrasi Besar ke Rancho East Side & Lahirnya Gerbang W-Hotdog',
    era: 'ERA EKSPANSI // EAST SIDE RANCHO',
    turfName: 'Jamestown Street, Rancho (East Side)',
    postalCode: 'RANCHO // JAMESTOWN BLOCK',
    logoUsed: '/assets/logo_v1.png',
    logoName: '4BS East Side Era Crest',
    mapImage: '/assets/hood_east.webp',
    actionImage: '/assets/streams/war_allstar.jpg',
    quote: 'Jamestown Street mengajarkan kami bahwa wilayah bukan hanya soal batas jalan, melainkan siapa yang sanggup bertahan saat malam paling berdarah tiba.',
    summary:
      'Memasuki babak kedua, 4Bloods memindahkan pusat kekuatan mereka ke kawasan ikonik Jamestown Street di East Side (Rancho). Di era ini pula sistem kaderisasi jalanan melalui W-Hotdog dibentuk.',
    paragraphs: [
      'Keputusan strategis untuk menguasai Jamestown Street di kawasan East Side (Rancho) mengubah skala operasi 4Bloods secara drastis. Kompleks apartemen bata merah Jamestown menjadi benteng pertahanan sekaligus titik kumpul puluhan anggota aktif setiap malamnya.',
      'Seiring membesarnya nama 4Bloods, arus orang luar yang ingin bergabung semakin padat. Untuk memastikan tidak ada penyusup atau kutu loncat, 4Bloods mendirikan bisnis kedok sekaligus gerbang seleksi ketat bernama W-Hotdog. Setiap calon anggota (Outsider & Locals) wajib membuktikan dedikasi RP, loyalitas, dan kesiapan mental mereka dari bawah sebelum diizinkan mengenakan atribut merah.'
    ],
    milestones: [
      { label: 'PENGUASAAN JAMESTOWN STREET', detail: 'Konsolidasi blok perumahan Rancho East Side sebagai markas besar Chapter II.' },
      { label: 'PENDIRIAN W-HOTDOG', detail: 'Bisnis kuliner jalanan resmi yang berfungsi sebagai filter seleksi & rekrutmen kandidat.' },
      { label: 'REGENERASI UNDER OG', detail: 'Penguatan struktur komando lapangan di bawah para Under OG untuk memimpin peperangan.' }
    ],
    colorsRule: 'Merah, Hitam, Putih & Abu-Abu Jalanan (Jamestown Spec)'
  },
  {
    id: 'chapter-3',
    number: '03',
    roman: 'CHAPTER III',
    title: 'SOUTH SIDE ROXWOOD (SSR)',
    subtitle: 'Transformasi Menuju 4BG (Four Bloods Gang) & Supremasi Kota Baru',
    era: 'ERA SEKARANG // POSTAL 1051–1052',
    turfName: 'South Side Roxwood (Postal 1051 - 1052)',
    postalCode: 'SSR // POSTAL 1051 - 1052',
    logoUsed: '/assets/logo_v2.png',
    logoName: '4BG Dual-Glock Red Bandana Crest (Current)',
    mapImage: '/assets/hood_roxwood.png',
    actionImage: '/assets/streams/nahmier_roxwood.jpg',
    quote: 'Hidup dalam darah, berjalan bersama keluarga, dan mati demi 4Bloods.',
    summary:
      'Babak terbaru dan paling matang dari 4Bloods. Menguasai teritori strategis South Side Roxwood (Postal 1051–1052), memperbarui lambang menjadi 4BG (Four Bloods Gang), dan dipimpin di lapangan oleh Hood President Nahmier Davies.',
    paragraphs: [
      'Di Chapter III, 4Bloods melakukan ekspansi besar menuju kawasan South Side Roxwood (SSR) tepatnya di blok Postal 1051 hingga 1052. Bersamaan dengan perpindahan wilayah ini, 4Bloods resmi memperkenalkan pembaruan lambang organisasi dari 4BS menjadi 4BG (Four Bloods Gang) dengan simbol dua pucuk pistol Glock bersilang di atas bandana merah.',
      'Di bawah pengawasan para OG dan komando taktis Hood President / Under OG seperti Nahmier Davies, Asep Teriyaki, Joy Braxton, Jane Elisha, Rusdi "Abuy" Walker, serta Deden Walker, 4Bloods kini berdiri sebagai ekosistem komunitas dan faksi roleplay terbesar dengan 54+ kreator aktif, merilis karya musik orisinal (THIS IS 4BLOODS, EBK), dan mendominasi skena peperangan liga maupun skenario jalanan di ImeRP.'
    ],
    milestones: [
      { label: 'EKSODUS KE SOUTH SIDE ROXWOOD', detail: 'Penguasaan penuh blok Postal 1051–1052 sebagai wilayah kedaulatan baru 4Bloods.' },
      { label: 'REBRANDING RESMI 4BG', detail: 'Evolusi logo menjadi 4BG (Four Bloods Gang) Dual-Glock Bandana Diamond.' },
      { label: 'ERA MEDIA & 54 STREAMER HUB', detail: 'Peluncuran karya musik resmi, Diss Track, dan ekosistem Multi-POV 4Bloods Cam.' }
    ],
    colorsRule: 'Crimson Blood (#DC2626), Obsidian Black (#050507), Pure White & Concrete Grey'
  }
];

export const HIERARCHY_TIERS = [
  {
    tier: '01',
    code: 'OG',
    name: 'ORIGINAL GANGSTER',
    role: 'Pemimpin Tertinggi & Dewan Pendiri',
    desc: 'Pemegang keputusan tertinggi organisasi, penjaga filosofi dasar 4Bloods, serta penentu arah besar aliansi dan peperangan faksi.',
    badgeColor: '#DC2626'
  },
  {
    tier: '02',
    code: 'UNDER OG',
    name: 'UNDER OG / HOOD PRESIDENT',
    role: 'Komandan Lapangan & Eksekutor Strategis',
    desc: 'Mengatur jalannya roda organisasi sehari-hari di hood, memimpin taktik peperangan (shotcaller), mengawasi brangkas logistik, dan menjaga disiplin seluruh anggota.',
    badgeColor: '#EF4444'
  },
  {
    tier: '03',
    code: 'YOUNG BLOODS',
    name: 'YOUNG BLOODS (YB)',
    role: 'Anggota Inti & Garda Tempur Utama',
    desc: 'Anggota penuh yang telah melewati seluruh ujian loyalitas. Menjadi tulang punggung peperangan, operasi ekonomi ilegal, dan pembimbing bagi generasi di bawahnya.',
    badgeColor: '#F87171'
  },
  {
    tier: '04',
    code: 'YOUNGSTER',
    name: 'YOUNGSTER',
    role: 'Kader Muda & Penggerak Jalanan',
    desc: 'Generasi muda yang telah resmi mengenakan warna 4Bloods dan aktif menjalankan misi lapangan, menjaga ketertiban blok, serta menyuplai kebutuhan operasional.',
    badgeColor: '#A1A1AA'
  },
  {
    tier: '05',
    code: 'LOCALS',
    name: 'LOCALS',
    role: 'Warga Blok & Kandidat Terverifikasi',
    desc: 'Individu yang sudah diterima tinggal dan beraktivitas di sekitar teritori 4Bloods serta sedang berada dalam tahap pembuktian akhir sebelum diangkat menjadi Youngster.',
    badgeColor: '#71717A'
  },
  {
    tier: '06',
    code: 'OUTSIDER',
    name: 'OUTSIDER (W-HOTDOG)',
    role: 'Tahap Seleksi Awal & Pekerja W-Hotdog',
    desc: 'Pintu gerbang pertama bagi siapa pun yang ingin mendekat ke 4Bloods. Diuji melalui kerja nyata di W-Hotdog, pengecekan integritas, dan kontribusi material.',
    badgeColor: '#52525B'
  }
];

export const WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'hoodie-merah-v1',
    name: '4BLOODS SIGNATURE RED HOODIE V1',
    category: 'hoodie',
    categoryLabel: 'HEAVY HOODIE',
    tier: 'CORE UNIFORM // ALL FULL MEMBERS',
    badge: 'CORE UNIFORM',
    badgeVariant: 'red',
    subtitle: '450GSM HEAVYWEIGHT FLEECE',
    tag: 'CRIMSON RED',
    era: 'CHAPTER I – III',
    frontImage: '/assets/hoodie_merah1.png',
    flipAvailable: false,
    description: 'Hoodie merah darah ikonik dengan bordir tipografi Old English 4Bloods di dada. Wajib digunakan saat berkumpul di hood maupun operasi konvoi.',
    specs: ['Heavyweight Fleece 450GSM', 'Crimson Red #DC2626', 'Old English 4Bloods Embroidery', 'Custom In-Game 3D Mesh']
  },
  {
    id: 'hoodie-merah-v2',
    name: '4BLOODS FLAMING SKULL RED HOODIE V2',
    category: 'hoodie',
    categoryLabel: 'HEAVY HOODIE',
    tier: 'WAR & TURF EDITION',
    badge: 'WAR & TURF',
    badgeVariant: 'red',
    subtitle: '480GSM FLAME FLEECE',
    tag: 'FLAME PRINT',
    era: 'CHAPTER II – III',
    frontImage: '/assets/hoodie_merah2.png',
    flipAvailable: false,
    description: 'Varian hoodie merah dengan grafis tengkorak berapi (Flaming Skull) di bagian punggung dan detail flame putih di lengan—sering terlihat dipakai melingkar bersama OG Ilham Joseph.',
    specs: ['Back Skull Flame Artwork', 'Sleeve Flame Print', 'High-Visibility Turf Red', 'Thermal Insulated Lining']
  },
  {
    id: 'hoodie-hitam',
    name: '4BLOODS NIGHT OPS BLACK HOODIE',
    category: 'hoodie',
    categoryLabel: 'HEAVY HOODIE',
    tier: 'NIGHT OPERATIONS // STEALTH',
    badge: 'STEALTH OPS',
    badgeVariant: 'slate',
    subtitle: '480GSM OBSIDIAN FLEECE',
    tag: 'NIGHT OPS',
    era: 'CHAPTER II – III',
    frontImage: '/assets/hoodie_hitam.png',
    flipAvailable: false,
    description: 'Hoodie hitam pekat dengan aksen merah menyala untuk pergerakan malam hari, pengintaian, dan operasi senyap di luar teritori.',
    specs: ['Obsidian Black Base', 'Crimson Chest Crest', 'Stealth Street Cut', 'Low-Reflective Matte Finish']
  },
  {
    id: 'workshirt-hitam',
    name: '4BG DICKIES WORKSHIRT — BLACK EDITION',
    category: 'workshirt',
    categoryLabel: 'TACTICAL WORKSHIRT',
    tier: 'OG & UNDER OG SIGNATURE',
    badge: 'WEST COAST',
    badgeVariant: 'orange',
    subtitle: 'CHICANO WORKWEAR',
    tag: 'DUAL-SIDE RENDER',
    era: 'CHAPTER II – III',
    frontImage: '/assets/shirt_hitam_depan.png',
    backImage: '/assets/shirt_hitam_belakang.png',
    flipAvailable: true,
    description: 'Kemeja kerja lengan pendek bergaya West Coast dengan potongan boxy, dilengkapi patch depan dan grafis punggung eksklusif 4Bloods.',
    specs: ['Front & Back Custom Print', 'Crisp Collar Structure', 'Dual-Side Render Available', 'Chicano West Coast Cut']
  },
  {
    id: 'workshirt-abu',
    name: '4BG DICKIES WORKSHIRT — CONCRETE GREY',
    category: 'workshirt',
    categoryLabel: 'TACTICAL WORKSHIRT',
    tier: 'HOOD CASUAL & BUSINESS',
    badge: 'CONCRETE GREY',
    badgeVariant: 'slate',
    subtitle: 'TWILL WORKWEAR',
    tag: 'HOOD CASUAL',
    era: 'CHAPTER II – III',
    frontImage: '/assets/shirt_abu.png',
    flipAvailable: false,
    description: 'Varian warna abu-abu beton (Concrete Grey) yang merepresentasikan salah satu dari empat warna resmi 4Bloods (Merah, Hitam, Putih, Abu-abu).',
    specs: ['Concrete Grey Tone', 'Contrast Red Graphics', 'Relaxed Street Fit', 'Reinforced Chest Pockets']
  },
  {
    id: 'tee-hooddays-v1',
    name: '4BLOODS "HOOD DAYS" GRAPHIC TEE V1',
    category: 'tee',
    categoryLabel: 'HOODDAYS TEE',
    tier: 'SOUTH SIDE ROXWOOD DROP',
    badge: 'ROXWOOD DROP',
    badgeVariant: 'cyan',
    subtitle: '240GSM OVERSIZED',
    tag: 'DUAL-SIDE RENDER',
    era: 'CHAPTER III',
    frontImage: '/assets/tee_hooddays1_depan.png',
    backImage: '/assets/tee_hooddays1_belakang.png',
    flipAvailable: true,
    description: 'Kaos oversized edisi Hood Days dengan ilustrasi kehidupan blok 4Bloods di bagian depan dan tipografi penuh di bagian punggung.',
    specs: ['Front & Back Artwork', 'Drop-Shoulder Cut', '100% Streetwear Heritage', 'High-Density Screenprint']
  },
  {
    id: 'tee-hooddays-v2',
    name: '4BLOODS "HOOD DAYS" GRAPHIC TEE V2',
    category: 'tee',
    categoryLabel: 'HOODDAYS TEE',
    tier: 'SOUTH SIDE ROXWOOD DROP',
    badge: 'CHAPTER III',
    badgeVariant: 'cyan',
    subtitle: 'SCREENPRINT 240GSM',
    tag: 'BOXY SILHOUETTE',
    era: 'CHAPTER III',
    frontImage: '/assets/tee_hooddays2_depan.png',
    flipAvailable: false,
    description: 'Edisi kedua kaos Hood Days dengan komposisi visual kontras tinggi yang menegaskan identitas skena jalanan Roxwood.',
    specs: ['High-Contrast Screenprint', 'Boxy Silhouette', 'Chapter III Exclusive', '240GSM Heavy Cotton']
  },
  {
    id: 'cap-official-v1',
    name: '4BG FITTED SNAPBACK CAP — CRIMSON',
    category: 'headwear',
    categoryLabel: 'HEADWEAR & ACCS',
    tier: 'SIGNATURE ACCESSORY',
    badge: 'SIGNATURE CAP',
    badgeVariant: 'red',
    subtitle: '3D PUFF EMBROIDERY',
    tag: '2 STYLES INCLUDED',
    era: 'CHAPTER I – III',
    frontImage: '/assets/topi_1.png',
    backImage: '/assets/topi_2.png',
    flipAvailable: true,
    description: 'Topi snapback resmi dengan bordir timbul 4Bloods. Tersedia dalam dua variasi gaya pemakaian untuk melengkapi setelan hood.',
    specs: ['3D Puff Embroidery', 'Crimson Crown', '2 Variant Styles Included', 'Structured Crown Profile']
  },
  {
    id: 'sling-bag-tactical',
    name: '4BLOODS TACTICAL SLING & DUFFEL BAG',
    category: 'bag',
    categoryLabel: 'TACTICAL GEAR',
    tier: 'LOGISTICS & FIELD CARRY',
    badge: 'LOGISTICS GEAR',
    badgeVariant: 'orange',
    subtitle: 'CORDURA TACTICAL',
    tag: 'DUAL CARRY MODES',
    era: 'CHAPTER II – III',
    frontImage: '/assets/bag_1.png',
    backImage: '/assets/bag_2.png',
    flipAvailable: true,
    description: 'Tas selempang taktis berlogo 4Bloods yang digunakan anggota saat membawa logistik peperangan, amunisi, maupun hasil operasi.',
    specs: ['Heavy Cordura Texture', 'Custom 4BG Branding', '2 Carry Configurations', 'MOLLE Tactical Straps']
  }
];

export const OFFICIAL_MEDIA_TRACKS: MediaTrack[] = [
  {
    id: 'this-is-4bloods',
    videoId: 'wJyovquNR24',
    title: 'THIS IS 4BLOODS (Official Music Video)',
    artist: '4BLOODS MEDIA',
    type: 'OFFICIAL MV',
    duration: '03:42',
    thumb: '/assets/yt_this_is_4bloods.jpg',
    description: 'Anthem kebanggaan utama 4Bloods yang menampilkan visual sinematik kekuatan anggota, deretan kendaraan merah, dan kedaulatan teritori mereka di ImeRP.'
  },
  {
    id: 'ebk-audio',
    videoId: 'ERErTx3snC0',
    title: 'EBK — EVERYBODY KILLER (Official Audio)',
    artist: '4BLOODS SOUND',
    type: 'OFFICIAL AUDIO',
    duration: '02:58',
    thumb: '/assets/yt_ebk.jpg',
    description: 'Track agresif bertempo cepat yang merepresentasikan mentalitas tanpa kompromi 4Bloods saat menghadapi koalisi musuh di medan perang.'
  },
  {
    id: '4bloods-for-life',
    videoId: 'LnUPC7RgivI',
    title: '4BLOODS FOR LIFE (Official Anthem)',
    artist: '4BLOODS COLLECTIVE',
    type: 'ANTHEM',
    duration: '03:15',
    thumb: '/assets/yt_4bloods_for_life.jpg',
    description: 'Lagu penghormatan terhadap perjalanan panjang persaudaraan 4Bloods dari masa West Side, Jamestown Street, hingga era keemasan Roxwood.'
  },
  {
    id: 'diss-dobrak',
    videoId: 'QCxFaAx-fcU',
    title: 'DOBRAK — 4BLOODS DISS TRACK',
    artist: '4BLOODS RECORDS',
    type: 'DISS TRACK',
    target: 'RIVAL FACTION DISS',
    duration: '03:08',
    thumb: '/assets/yt_dobrak_diss.jpg',
    description: 'Diss track tajam sebagai bentuk psywar budaya jalanan yang memanaskan tensi konflik antarfaksi di dalam skena roleplay.'
  },
  {
    id: 'diss-boa',
    videoId: '7LOrZ9-4cTc',
    title: 'BOA — 4BLOODS DISS TRACK',
    artist: '4BLOODS RECORDS',
    type: 'DISS TRACK',
    target: 'BOA FACTION DISS',
    duration: '02:54',
    thumb: '/assets/yt_boa_diss.jpg',
    description: 'Balasan lirik keras khas skena hip-hop gangsta yang menegaskan dominasi 4Bloods baik di jalanan maupun di panggung karya.'
  }
];

export const WAR_ARCHIVES: WarArchive[] = [
  {
    id: 'nahmier-roxwood',
    videoId: 'ylYwKzRaYeQ',
    title: 'ROXWOOD SEMAKIN MEMANAS!! INIKAH SAATNYA?! BHB BERSIAPLAH',
    streamer: 'Nahmier Davies',
    rank: 'UNDER OG // HOOD PRESIDENT',
    category: 'NAHMIER POV',
    thumb: '/assets/streams/nahmier_roxwood.jpg',
    tag: 'CHAPTER III CONFLICT'
  },
  {
    id: 'nahmier-cayo',
    videoId: 'fToo-U7hAs8',
    title: 'MISI MEMPEREBUTKAN PULAU CAYO!! KOMANDO PENUH 4BLOODS',
    streamer: 'Nahmier Davies',
    rank: 'UNDER OG // HOOD PRESIDENT',
    category: 'NAHMIER POV',
    thumb: '/assets/streams/nahmier_cayo.jpg',
    tag: 'SPECIAL OPERATION'
  },
  {
    id: 'nahmier-liga',
    videoId: 'H3mnaXEWzCs',
    title: 'LIGA ROXWOOD DAN CUMER BERSAMAAN!! 4BLOODS VS VAGABOND',
    streamer: 'Nahmier Davies',
    rank: 'UNDER OG // HOOD PRESIDENT',
    category: 'NAHMIER POV',
    thumb: '/assets/streams/nahmier_liga.jpg',
    tag: 'TOURNAMENT & TURF WAR'
  },
  {
    id: 'nahmier-rampok',
    videoId: 'i1qxqRtdMzM',
    title: 'MENCARI KANDIDAT MEMBER RAMPOK!! SELEKSI LAPANGAN 4BLOODS',
    streamer: 'Nahmier Davies',
    rank: 'UNDER OG // HOOD PRESIDENT',
    category: 'NAHMIER POV',
    thumb: '/assets/streams/nahmier_rampok.jpg',
    tag: 'RECRUITMENT & HEIST'
  },
  {
    id: 'ilham-return',
    videoId: 'LwzAe09GEH8',
    title: 'ILHAM THE RED BANDANA — 4BLOOD IS BACK LETS GO!',
    streamer: 'Ilham Joseph (Windah Basudara)',
    rank: 'ORIGINAL GANGSTER (OG)',
    category: 'OG SPOTLIGHT',
    thumb: '/assets/streams/ilham_back.jpg',
    tag: 'LEGENDARY OG MOMENT'
  },
  {
    id: 'asep-warrant',
    videoId: 'UG1hYx8jSeA',
    title: 'THIS IS ASEP 4BLOODS — TOP 1 WARRANT LOS SANTOS',
    streamer: 'Asep Teriyaki',
    rank: 'UNDER OG',
    category: 'OG SPOTLIGHT',
    thumb: '/assets/streams/asep_top1.jpg',
    tag: 'MOST WANTED RP'
  },
  {
    id: 'deja-charity',
    videoId: 'K6kfspfbAwM',
    title: 'CHARITY 4BLOOD TO IMEFEST JAKARTA — SOLIDARITAS KOMUNITAS',
    streamer: 'Deja Amari',
    rank: 'ORIGINAL GANGSTER (OG)',
    category: 'OG SPOTLIGHT',
    thumb: '/assets/streams/deja_charity.jpg',
    tag: 'COMMUNITY EVENT'
  },
  {
    id: 'war-allstar-20v20',
    videoId: 'a3NgNy4NDMU',
    title: 'AFTERNOON LEAGUE WAR!! 4BLOODS VS ALLSTAR (20 VS 20 ALLCLASS)',
    streamer: '4Bloods War Archive',
    rank: 'FULL SQUAD DEPLOYMENT',
    category: 'LEAGUE WAR',
    thumb: '/assets/streams/war_allstar.jpg',
    tag: '20V20 ALL CLASS'
  },
  {
    id: 'war-51reaver',
    videoId: '9hhP8B0dDN8',
    title: 'PERANG PANAS!! 4BLOODS VS 51REAVER PECAH DI ROXWOOD',
    streamer: '4Bloods War Archive',
    rank: 'ROXWOOD DEFENSE',
    category: 'LEAGUE WAR',
    thumb: '/assets/streams/war_51reaver.jpg',
    tag: 'ROXWOOD TURF WAR'
  }
];

// All 54 Real Members & Channel IDs from 4bloodmw.vercel.app + ImeRP Wiki Hierarchy
export const STREAMER_ROSTER: StreamerMember[] = [
  {
    name: 'Ilham Joseph',
    channelId: 'UCzjGSL8HMCRUi1sWH5VYGjQ',
    rank: 'OG',
    role: 'Original Gangster // Founding Father (Windah Basudara)',
    chapter: 'Chapter I – III',
    featuredVideoId: 'LwzAe09GEH8',
    featuredTitle: '4BLOOD IS BACK LETS GO! #imeroleplay',
    featuredThumb: '/assets/streams/ilham_back.jpg',
    bio: 'Sosok ikonik pendiri 4Bloods ("Ilham The Red Bandana") yang menjadi simbol persatuan dan magnet utama skena roleplay 4Bloods sejak era West Side.'
  },
  {
    name: 'Louis Ven',
    channelId: 'UC79cKOK5rTIABhvXxeINdHw',
    rank: 'OG',
    role: 'Original Gangster // Supreme Strategist',
    chapter: 'Chapter I – III',
    featuredVideoId: 'OIM_8ZymT60',
    featuredTitle: 'SANTRI LV BERI DAKWAH KE ANAK-ANAK 4BLOODS',
    featuredThumb: '/assets/streams/war_mx69.jpg',
    bio: 'Salah satu dari empat pilar OG utama yang menjaga stabilitas internal, diplomasi tingkat tinggi, dan arah strategis 4Bloods.'
  },
  {
    name: 'Deja Amari',
    channelId: 'UCWpOmCvUcYgjMrNW4LjvmCw',
    rank: 'OG',
    role: 'Original Gangster // High Council',
    chapter: 'Chapter I – III',
    featuredVideoId: 'K6kfspfbAwM',
    featuredTitle: 'CHARITY 4BLOOD TO IMEFEST JKT #4blood',
    featuredThumb: '/assets/streams/deja_charity.jpg',
    bio: 'OG karismatik yang menggerakkan solidaritas internal maupun kegiatan komunitas 4Bloods di dalam dan luar kota.'
  },
  {
    name: 'Muhammad Sumbul',
    channelId: 'UC6a-XQK_U4lsMfODIbgrFAA',
    rank: 'OG',
    role: 'Original Gangster // Warlord Vanguard',
    chapter: 'Chapter I – III',
    featuredVideoId: 'UWzNP0fxL_A',
    featuredTitle: 'SUMBUL SIAP MENJADI GARDA TERDEPAN 4BLOODS',
    featuredThumb: '/assets/streams/sumbul_garda.jpg',
    bio: 'Pilar OG yang dikenal selalu turun langsung menjadi garda terdepan saat 4Bloods menghadapi krisis maupun peperangan besar.'
  },
  {
    name: 'Nahmier Davies',
    channelId: 'UCgO8kYJBkm5jvUJkV9H9mIw',
    rank: 'Under OG',
    role: 'Hood President // Tactical Field Commander',
    chapter: 'Chapter I – III',
    featuredVideoId: 'ylYwKzRaYeQ',
    featuredTitle: 'ROXWOOD SEMAKIN MEMANAS INIKAH SAATNYA?!! #4blood',
    featuredThumb: '/assets/streams/nahmier_roxwood.jpg',
    bio: 'Hood President dan komandan lapangan utama 4Bloods di era South Side Roxwood. Memimpin operasi peperangan, rekrutmen perampokan, dan komando harian blok.'
  },
  {
    name: 'Asep Teriyaki',
    channelId: 'UCI1hbc1-qfszyjNYoNgkV2w',
    rank: 'Under OG',
    role: 'Under OG // Enforcer & Most Wanted',
    chapter: 'Chapter I – III',
    featuredVideoId: 'UG1hYx8jSeA',
    featuredTitle: 'THIS IS ASEP 4 BLOODS TOP 1 WARRANT LOS SANTOS',
    featuredThumb: '/assets/streams/asep_top1.jpg',
    bio: 'Under OG legendaris dengan reputasi Top 1 Warrant di Los Santos—eksekutor garis keras yang ditakuti di setiap skenario baku tembak.'
  },
  {
    name: 'Joy Braxton',
    channelId: 'UCiAlUeYsA39S5x_nQS2aT-Q',
    rank: 'Under OG',
    role: 'Under OG // Operations & Logistics',
    chapter: 'Chapter I – III',
    featuredVideoId: '9kVESNXI-L0',
    featuredTitle: 'INISIASI DRIVEBY!! 4BLOODS VS MX69',
    featuredThumb: '/assets/streams/war_mx69.jpg',
    bio: 'Perwira tinggi Under OG yang mengatur kesiapan tempur, kedisiplinan anggota, dan koordinasi konvoi 4Bloods.'
  },
  {
    name: 'Jane Elisha',
    channelId: 'UC9LmRRwAzHkCxlgbKW3tMjA',
    rank: 'Under OG',
    role: 'Under OG // Internal Affairs & Treasury',
    chapter: 'Chapter I – III',
    featuredVideoId: '9hhP8B0dDN8',
    featuredTitle: 'PERANG PANAS 4BLOODS VS 51REAVER DI ROXWOOD',
    featuredThumb: '/assets/streams/war_51reaver.jpg',
    bio: 'Sosok kunci di jajaran Under OG yang menjaga kerapian manajemen internal, kas keluarga, dan kohesi antar-anggota.'
  },
  {
    name: 'Ackai',
    channelId: 'UCvseheuTcY-BnPGsmfQ5K5g',
    handle: '@Ackaiii',
    rank: 'Under OG',
    role: 'Under OG // Walker Bloodline Commander (Rusdi)',
    chapter: 'Chapter I – III',
    featuredVideoId: 'a3NgNy4NDMU',
    featuredTitle: 'AFTERNOON LEAGUE WAR 4BLOODS VS ALLSTAR 20V20',
    featuredThumb: '/assets/streams/war_allstar.jpg',
    bio: 'Komandan lapangan senior dari klan Walker yang memimpin pertahanan teritori dan kaderisasi anggota tempur.'
  },
  {
    name: 'Deden Walker',
    channelId: 'UCAt1-AACF3v7FnOkLUuWCBA',
    rank: 'Under OG',
    role: 'Under OG // Tactical Strike Leader',
    chapter: 'Chapter I – III',
    featuredVideoId: 'fToo-U7hAs8',
    featuredTitle: 'MISI MEMPEREBUTKAN PULAU CAYO!! BERSIAP',
    featuredThumb: '/assets/streams/nahmier_cayo.jpg',
    bio: 'Under OG yang berperan vital dalam pengamanan blok Roxwood serta komando taktis saat peperangan terbuka.'
  },
  { name: 'Keedo Chaser', channelId: 'UCxR4hAbipLyiWfmaF0rEAvg', rank: 'Young Bloods', role: 'Young Bloods // Frontline Shooter', chapter: 'Chapter II – III' },
  { name: 'Geo Blitz', channelId: 'UC7KiVxdO5HiAwIrbz--RG1w', rank: 'Young Bloods', role: 'Young Bloods // Vanguard', chapter: 'Chapter II – III' },
  { name: 'Vall Diego', channelId: 'UCmlRglH7APivrEiDLNYK8DQ', rank: 'Young Bloods', role: 'Young Bloods // Street Enforcer', chapter: 'Chapter II – III' },
  { name: 'Grimm Jow', channelId: 'UC8opURjNDJhx5OtgMsekvMQ', rank: 'Young Bloods', role: 'Young Bloods // Heavy Unit', chapter: 'Chapter II – III' },
  { name: 'NiM', channelId: 'UCq-2EZzC5ps6WL77LIDWVZg', rank: 'Young Bloods', role: 'Young Bloods // Recon & Driver', chapter: 'Chapter II – III' },
  { name: 'TET', channelId: 'UC-j54how4NIqu2rJMTvH_2A', rank: 'Young Bloods', role: 'Young Bloods // Combat Specialist', chapter: 'Chapter II – III' },
  { name: 'Robbe Loxse', channelId: 'UCuTN4Rl32nqN6WoIRaElEpQ', rank: 'Young Bloods', role: 'Young Bloods // Turf Defender', chapter: 'Chapter II – III' },
  { name: 'Patra', channelId: 'UCCEDmX6Jl-fwm4fywtwo4pQ', rank: 'Young Bloods', role: 'Young Bloods // Field Operative', chapter: 'Chapter II – III' },
  { name: 'Al Pacino', channelId: 'UC8Z53mHi83vhNEqzPcUr_2w', rank: 'Young Bloods', role: 'Young Bloods // Syndicate Soldier', chapter: 'Chapter II – III' },
  { name: 'Ones Gilford', channelId: 'UCoDXbUJQAFJhr7Tc9h0kOng', rank: 'Young Bloods', role: 'Young Bloods // Strike Team', chapter: 'Chapter II – III' },
  { name: 'Beck Heist', channelId: 'UCRBqlWhaKfPQVobdHdCocrg', rank: 'Young Bloods', role: 'Young Bloods // Heist Specialist', chapter: 'Chapter II – III' },
  { name: 'Tom Kendrick', channelId: 'UCWo4HDG6p3pXSErXm3NADew', rank: 'Young Bloods', role: 'Young Bloods // Street Soldier', chapter: 'Chapter II – III' },
  { name: 'Tyler Brown', channelId: 'UCGn04RUUMb6An52go-FtX-Q', rank: 'Young Bloods', role: 'Young Bloods // Convoy Lead', chapter: 'Chapter II – III' },
  { name: 'Aceng Salim', channelId: 'UC-Rz8TjBl5jZKRYz3-ce0Wg', rank: 'Young Bloods', role: 'Young Bloods // Hood Guardian', chapter: 'Chapter II – III' },
  { name: 'dixie', channelId: 'UCqH1g6fv5t2bNHz-VA_nrjw', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'aufy', channelId: 'UCQ1n_PUxgvTn9nZISqHpylw', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Ujang Walker', channelId: 'UCqUhn7QlVk9MJStkR5Q_59g', rank: 'Young Bloods', role: 'Young Bloods // Walker Clan', chapter: 'Chapter II – III' },
  { name: 'Dai Helsein', channelId: 'UCV6F4SQBDiomWQyYuWdOi-w', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Rubby S Walker', channelId: 'UCx3LtULB8Xm5F02tectuojA', rank: 'Young Bloods', role: 'Young Bloods // Walker Clan', chapter: 'Chapter II – III' },
  { name: 'Moongskie', channelId: 'UCVqyNp9LM2htRULABiI_cyA', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Flip Flop', channelId: 'UCtjLmmgBzjtND3i7bvyjLRQ', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Nayara', channelId: 'UCmOPopMKHUDkxqQ2lyL0b0g', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Azmi', channelId: 'UCHi0xCfpNPut25e_jcRcC3A', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Gavin', channelId: 'UCYq6sqBIJePerAfUq9SwiPA', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Axel', channelId: 'UC4v9jRHgw5ZUt9MC8kB9rUw', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'znah', channelId: 'UCYG2Pp0MZvxyziNXO8puT-Q', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Aeon', channelId: 'UCTu3uCZvVAOR8BsWmmKNN-w', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Nats', channelId: 'UCdCNBMGBzwYmtjO-kNsc9kA', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Kim', channelId: 'UCVbGCNvads9e5vZCfGva4-g', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Ras Dss', channelId: 'UCJh-SbdIxQyRYkIGtg6ud7w', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Garox', channelId: 'UC9XyLt5pDD4NduHJ0966stQ', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Ruby Joseph', channelId: 'UCi2Oz3Upz9HIPWQWfZKKyDg', rank: 'Young Bloods', role: 'Young Bloods // Joseph Family', chapter: 'Chapter II – III' },
  { name: 'hulio', channelId: 'UCgSQDGh4U78yLhH3O7Og3bA', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Dorres', channelId: 'UCsEvcoi_wij2pzIyom8AV0Q', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Riko', channelId: 'UCgUolxj0PXw0sMi9tMka06Q', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'suwep', channelId: 'UC9arc3t1vp7h5y9etaFL2uA', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'brandon', channelId: 'UCrnxCHeqxcV6sGEWiBAbxoA', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Valen', channelId: 'UCgZmHc49xPv6X_Z3FTw1aqQ', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Alzod', channelId: 'UCEt0sRBLpWOhZSQQ8VDYtVw', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'udin', channelId: 'UCKd-ef2JJtWqRtjl1OiN3qw', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Ellaaa', channelId: 'UCJziR1GfVMZyx3yCCXT3Utg', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Kynee', channelId: 'UCx9D32C8ZFaz1kPkBASSAzQ', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Rey', channelId: 'UCg6Bo5s6ZRkyfQSxtlQkZrQ', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' },
  { name: 'Kris', channelId: 'UCd1cNSgpTe30q_o9UbDmqPA', rank: 'Member', role: 'Official Streamer // Roster', chapter: 'Chapter III' }
];
