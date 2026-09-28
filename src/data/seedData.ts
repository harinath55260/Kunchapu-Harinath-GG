import { CountryItem, CategoryItem, VideoItem } from '../types';

export const CULTURAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'food',
    name: 'Food & Cuisine',
    icon: '🍲',
    description: 'Traditional gastronomy, culinary arts, street markets, and family recipes passed across generations.'
  },
  {
    id: 'festivals',
    name: 'Festivals & Celebrations',
    icon: '🎉',
    description: 'Vibrant local festivals, seasonal carnivals, sacred rituals, and cultural celebrations.'
  },
  {
    id: 'traditions',
    name: 'Traditions & Rituals',
    icon: '🏮',
    description: 'Centuries-old social customs, ceremonial rites, crafts, and ancestral heritage.'
  },
  {
    id: 'music',
    name: 'Music & Instruments',
    icon: '🎵',
    description: 'Indigenous instruments, folk melodies, classical compositions, and rhythmic expressions.'
  },
  {
    id: 'dance',
    name: 'Dance & Performing Arts',
    icon: '💃',
    description: 'Folk dances, theatrical storytelling, classical choreographies, and sacred movement.'
  },
  {
    id: 'clothing',
    name: 'Clothing & Textiles',
    icon: '👘',
    description: 'Traditional garments, weaving craftsmanship, ceremonial dress, and textile heritage.'
  },
  {
    id: 'history',
    name: 'History & Architecture',
    icon: '🏛',
    description: 'Ancient monuments, living history, temples, castles, and historic landmarks.'
  },
  {
    id: 'art',
    name: 'Art & Craftsmanship',
    icon: '🎨',
    description: 'Pottery, calligraphy, wood carving, indigenous paintings, and master artisanal crafts.'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Community',
    icon: '🏡',
    description: 'Daily life customs, philosophy, wellness rituals, village communities, and hospitality.'
  },
  {
    id: 'nature',
    name: 'Nature & Sacred Heritage',
    icon: '🌿',
    description: 'Sacred mountains, rivers, cultural landscapes, and indigenous ecological harmony.'
  }
];

export const CULTURAL_COUNTRIES: CountryItem[] = [
  {
    id: 'india',
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    region: 'South Asia',
    greeting: 'Namaste • नमस्ते',
    civilizationAge: '5,000+ Years',
    unescoSitesCount: 42,
    officialLanguages: '22 Recognized Languages (Hindi, Tamil, Bengali, Telugu, Sanskrit...)',
    capital: 'New Delhi',
    currency: 'Indian Rupee (₹ INR)',
    description: 'A sovereign civilizational subcontinent where timeless spiritual philosophies, sacred river ghats, eight recognized classical dance traditions, millennia of Ayurvedic medicine, vibrant regional handlooms, and cosmic festivals celebrate the universal ethos of Vasudhaiva Kutumbakam ("The World is One Family").',
    bannerImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      {
        category: 'traditions',
        title: 'Ganga Aarti at Varanasi & Haridwar',
        description: 'Sacred evening ritual of multi-tiered brass oil lamps, conch shells, and Vedic hymns honouring Mother Ganga along ancient riverside stone ghats.'
      },
      {
        category: 'dance',
        title: 'Eight Classical Dance Traditions',
        description: 'Millennia-old Natya Shastra traditions including Bharatanatyam (Tamil Nadu), Kathak (North India), Kathakali (Kerala), Odissi (Odisha), and Kuchipudi.'
      },
      {
        category: 'festivals',
        title: 'Diwali, Holi & Regional Celebrations',
        description: 'Deepavali illuminating the victory of inner light over darkness, Holi powdered spring blossoms, Navratri Garba dances, Durga Puja, and Onam harvest feasts.'
      },
      {
        category: 'food',
        title: 'Ayurvedic Thali & Six-Taste Gastronomy',
        description: 'Holistic culinary philosophy harmonizing Shad-Rasa (sweet, sour, salty, pungent, bitter, and astringent) with regional spices, pure ghee, and lentils.'
      },
      {
        category: 'clothing',
        title: 'Handloom Sarees & Regal Textiles',
        description: 'Centuries-old artisanal weaves: Kanjeevaram pure mulberry silk, gold-zari Banarasi brocades, Chanderi, Pashmina wool, and Mahatma Gandhi’s Khadi heritage.'
      },
      {
        category: 'history',
        title: 'Architectural Wonders & Sacred Temples',
        description: 'From the immortal marble symmetry of the Taj Mahal to the monolithic rock-cut Kailasa temple in Ellora, Brihadisvara in Thanjavur, and ornate stepwells.'
      },
      {
        category: 'lifestyle',
        title: 'Yoga, Pranayama & Meditation Legacy',
        description: 'Birthplace of Yoga and Patanjali Sutras, teaching union of mind, body, and breath alongside the daily spiritual rhythm of Ahimsa (non-violence).'
      },
      {
        category: 'music',
        title: 'Carnatic & Hindustani Classical Music',
        description: 'Spiritual melodic improvisations governed by intricate Ragas (melodic frameworks) and Talas (rhythmic cycles) played on Sitar, Veena, Tabla, and Mridangam.'
      }
    ]
  },
  {
    id: 'japan',
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    region: 'East Asia',
    greeting: 'Konnichiwa • こんにちは',
    civilizationAge: '2,600+ Years',
    unescoSitesCount: 25,
    officialLanguages: 'Japanese',
    capital: 'Tokyo',
    currency: 'Japanese Yen (¥ JPY)',
    description: 'A harmonious tapestry of ancient Zen philosophies, refined tea ceremonies, historic shrines, and vibrant season-bound seasonal matsuri festivals.',
    bannerImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'traditions', title: 'Chado: The Way of Tea', description: 'Mindful preparation and serving of matcha powdered green tea in Kyoto tatami rooms.' },
      { category: 'clothing', title: 'Kimono & Nishijin-ori', description: 'Silk kimono with hand-dyed Yuzen patterns and centuries-old Obi sash weaving.' },
      { category: 'festivals', title: 'Gion Matsuri', description: 'Month-long July festival featuring towering ornate Yamaboko floats in ancient Kyoto.' },
      { category: 'food', title: 'Washoku Culinary Art', description: 'UNESCO-inscribed traditional Japanese cuisine honoring seasons and pristine ingredients.' }
    ]
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    code: 'KR',
    flag: '🇰🇷',
    region: 'East Asia',
    description: 'Dynamic cultural synthesis blending royal Joseon dynasty heritage, Hanok architecture, fermenting culinary rituals, and contemporary creative arts.',
    bannerImage: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'clothing', title: 'Hanbok Elegance', description: 'Graceful traditional Korean attire with vibrant curves, jeogori jackets, and chima skirts.' },
      { category: 'food', title: 'Kimjang Fermentation Ritual', description: 'UNESCO-listed autumn community gathering to prepare and share fermented kimchi for winter.' },
      { category: 'traditions', title: 'Chuseok Autumn Harvest', description: 'Traditional harvest festival honoring ancestors with songpyeon rice cakes and folk rituals.' },
      { category: 'music', title: 'Gugak & Samul Nori', description: 'Resonant percussion quartets and traditional court music celebrating nature spirits.' }
    ]
  },
  {
    id: 'brazil',
    name: 'Brazil',
    code: 'BR',
    flag: '🇧🇷',
    region: 'South America',
    description: 'A kaleidoscope of Afro-Indigenous-Portuguese rhythms, exuberance, communal street gatherings, Capoeira martial dance, and warm coastal hospitality.',
    bannerImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'festivals', title: 'Rio de Janeiro Carnival', description: 'The world-famous spectacle of Samba schools, elaborate float designs, and drum rhythms.' },
      { category: 'dance', title: 'Capoeira Heritage', description: 'Afro-Brazilian martial art combining dance, acrobatics, and live Berimbau music.' },
      { category: 'food', title: 'Feijoada & Bahian Flavors', description: 'Slow-simmered black bean stew and spicy Moqueca seafood scented with dendê palm oil.' },
      { category: 'music', title: 'Bossa Nova & Samba Roots', description: 'Intimate poetic acoustic guitar melodies pioneered in coastal Rio de Janeiro.' }
    ]
  },
  {
    id: 'italy',
    name: 'Italy',
    code: 'IT',
    flag: '🇮🇹',
    region: 'Southern Europe',
    description: 'Cradle of Renaissance artistry, passionate regional cuisines, opera, ancient Roman engineering, and vibrant village piazza gatherings.',
    bannerImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'food', title: 'Artisanal Pasta Crafting', description: 'Hand-rolled egg pasta traditions passed from nonna to nonna in Emilia-Romagna.' },
      { category: 'festivals', title: 'Venice Carnival Masks', description: 'Enchanting historical masquerade balls and handcrafted porcelain masks along the Grand Canal.' },
      { category: 'history', title: 'Living Roman Antiquity', description: 'Colosseum, Pompeii ruins, and Renaissance frescoes celebrated in open-air historic centers.' },
      { category: 'lifestyle', title: 'La Dolce Vita & Passeggiata', description: 'The leisurely evening stroll through cobblestone squares connecting community neighbors.' }
    ]
  },
  {
    id: 'mexico',
    name: 'Mexico',
    code: 'MX',
    flag: '🇲🇽',
    region: 'North America',
    description: 'Ancient Maya and Aztec roots interwoven with colonial traditions, bold gastronomy, mariachi serenades, and festive celebrations of life and memory.',
    bannerImage: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'festivals', title: 'Día de los Muertos', description: 'Joyful Day of the Dead honoring ancestors with marigold ofrendas, sugar skulls, and song.' },
      { category: 'food', title: 'Traditional Mole & Masa Nixtamalization', description: 'Complex 30-ingredient Oaxaca moles and hand-pressed ancient heirloom corn tortillas.' },
      { category: 'music', title: 'Mariachi Serenades', description: 'Guitarrón, violins, and trumpet ensembles carrying romantic and celebratory folk anthems.' },
      { category: 'art', title: 'Talavera & Alebrijes', description: 'Intricate glazed ceramics in Puebla and fantastical carved wooden spirit animals in Oaxaca.' }
    ]
  },
  {
    id: 'egypt',
    name: 'Egypt',
    code: 'EG',
    flag: '🇪🇬',
    region: 'North Africa & Middle East',
    description: 'Five millennia of civilization along the life-giving Nile river, monumental architecture, Nubian hospitality, and storied marketplace bazaars.',
    bannerImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'history', title: 'Monuments of Luxor & Giza', description: 'Valley of the Kings, Karnak Temple, and Pyramids preserving hieroglyphic wisdom.' },
      { category: 'traditions', title: 'Nubian Village Living', description: 'Colorfully painted mud-brick homes in Aswan, aromatic tea ceremonies, and warm communal songs.' },
      { category: 'food', title: 'Koshari & Street Heritage', description: 'Beloved national comfort food layering lentils, pasta, rice, spicy tomato sauce, and crispy shallots.' },
      { category: 'music', title: 'Oud Melodies & Tarab', description: 'Poetic musical performances eliciting deep emotion and cultural remembrance.' }
    ]
  },
  {
    id: 'france',
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    region: 'Western Europe',
    description: 'World-renowned gastronomic craftsmanship, historic châteaux, literary café salons, haute couture, and deep respect for terroir.',
    bannerImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'food', title: 'Artisanal Boulangerie & Wine Terroir', description: 'Baguette baking recognized by UNESCO, cheese aging cellars, and Bordeaux wine heritage.' },
      { category: 'festivals', title: 'Fête de la Musique', description: 'Summer solstice celebration with musicians filling every street corner across the country.' },
      { category: 'history', title: 'Loire Valley Châteaux', description: 'Architectural gems of Chambord and Chenonceau reflecting royal gardens and history.' },
      { category: 'art', title: 'Impressionist Heritage in Giverny', description: 'Monet’s gardens and the Bohemian Montmartre artist enclave in Paris.' }
    ]
  },
  {
    id: 'greece',
    name: 'Greece',
    code: 'GR',
    flag: '🇬🇷',
    region: 'Southern Europe',
    description: 'The cradle of democracy and philosophy, white-washed Aegean islands, olive groves, lively taverna celebrations, and joyous Zorba folk dances.',
    bannerImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'traditions', title: 'Philoxenia: Sacred Hospitality', description: 'Ancient cultural duty of welcoming strangers with fresh olive oil, honey, and open doors.' },
      { category: 'dance', title: 'Sirtaki & Kalamatianos', description: 'Communal circle dances with linked arms performed during village panigiria festivals.' },
      { category: 'food', title: 'Mediterranean Diet & Olive Harvest', description: 'Centuries of cold-pressed olive oils, mountain oregano, feta, and slow-baked claypot stews.' },
      { category: 'history', title: 'Acropolis & Delphi', description: 'Sacred ruins that gave birth to Western drama, architecture, mathematics, and philosophy.' }
    ]
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    code: 'VN',
    flag: '🇻🇳',
    region: 'Southeast Asia',
    description: 'Misty karst landscapes, aromatic pho street stalls, floating river markets, ao dai silk robes, and ancient water puppetry.',
    bannerImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'clothing', title: 'Ao Dai Silk Robe', description: 'Graceful tunic worn over trousers, embodying elegance, modesty, and Vietnamese pride.' },
      { category: 'food', title: 'Hanoi Phở & Street Kitchens', description: 'Fragrant star anise and cinnamon broths simmered for 12 hours with fresh herbs.' },
      { category: 'art', title: 'Water Puppetry (Múa Rối Nước)', description: 'Centuries-old folk performance on flooded rice fields reenacting folklore and harvest tales.' },
      { category: 'festivals', title: 'Tết Nguyên Đán', description: 'Lunar New Year reuniting families with peach blossoms, red banners, and sticky rice cakes.' }
    ]
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    code: 'NG',
    flag: '🇳🇬',
    region: 'West Africa',
    description: 'Giant of Africa with over 250 distinct ethnic cultures including Yoruba, Igbo, and Hausa, renowned for energetic Afrobeats, regal textiles, and festivals.',
    bannerImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    videoCount: 0,
    culturalHighlights: [
      { category: 'festivals', title: 'Argungu Fishing & Durbar Festival', description: 'Spectacular northern equestrian parades in ornate turbans and grand river fishing competitions.' },
      { category: 'clothing', title: 'Aso Ebi & Gele Headties', description: 'Vibrant lace, Ankara prints, and sculpted headwraps worn united at joyful wedding parties.' },
      { category: 'food', title: 'Jollof Rice & Suya Traditions', description: 'Smoky spiced party jollof rice and northern street skewers coated with aromatic yaji spice.' },
      { category: 'music', title: 'Talking Drum (Gangan) & Afrobeat', description: 'Hourglass drums imitating Yoruba vocal tones alongside pioneer Fela Kuti rhythms.' }
    ]
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [];
