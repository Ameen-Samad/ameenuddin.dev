export type GuitarType = 'acoustic' | 'electric' | 'ukulele'

export interface Guitar {
  id: number
  name: string
  image: string
  description: string
  shortDescription: string
  price: number
  type: GuitarType
  tags: string[]
  features: string[]
  designHighlights?: string[]
}

const guitars: Array<Guitar> = [
  {
    id: 1,
    name: 'TanStack Ukelele',
    image: '/example-ukelele-tanstack.jpg',
    description:
      "Introducing the TanStack Signature Ukulele—a beautifully handcrafted concert ukulele that combines exceptional sound quality with distinctive style. Featuring a warm, resonant koa-wood body with natural grain patterns, this instrument delivers the rich, mellow tones Hawaii is famous for. The exclusive TanStack palm tree inlay on the soundhole adds a unique touch of island flair, while the matching branded headstock makes this a true collector's piece for developers and musicians alike. Whether you're a beginner looking for a quality starter instrument or an experienced player wanting something special, the TanStack Ukulele brings together craftsmanship, character, and that unmistakable tropical spirit.",
    shortDescription:
      'Premium koa-wood ukulele featuring exclusive TanStack branding, perfect for beach vibes and island-inspired melodies.',
    price: 299,
    type: 'ukulele',
    tags: ['warm', 'mellow', 'tropical', 'beginner-friendly', 'island', 'folk', 'acoustic'],
    features: ['Koa-wood body', 'Palm tree inlay', 'Concert size', 'Branded headstock'],
    designHighlights: [
      'Koa wood provides naturally warm, balanced tones ideal for Hawaiian music',
      'Concert size offers fuller sound than soprano while staying portable',
      'Palm tree inlay and branding make this a unique collector\'s piece',
    ],
  },
  {
    id: 2,
    name: 'Video Game Guitar',
    image: '/example-guitar-video-games.jpg',
    description:
      "The Video Game Guitar is a unique acoustic guitar that features a design inspired by video games. It has a sleek, high-gloss finish and a comfortable playability. The guitar's ergonomic body and fast neck profile ensure comfortable playability for hours on end.",
    shortDescription:
      'A unique electric guitar with a video game design, high-gloss finish, and comfortable playability.',
    price: 699,
    type: 'electric',
    tags: ['gaming', 'modern', 'fun', 'comfortable', 'unique', 'pop', 'rock'],
    features: ['High-gloss finish', 'Ergonomic body', 'Fast neck profile', 'Video game artwork'],
    designHighlights: [
      'Ergonomic contours reduce fatigue during marathon gaming sessions',
      'Fast neck profile enables quick transitions between complex chord progressions',
      'High-gloss finish protects the unique artwork while adding visual pop',
    ],
  },
  {
    id: 3,
    name: 'Superhero Guitar',
    image: '/example-guitar-superhero.jpg',
    description:
      "The Superhero Guitar is a bold black electric guitar that stands out with its unique superhero logo design. Its sleek, high-gloss finish and powerful pickups make it perfect for high-energy performances. The guitar's ergonomic body and fast neck profile ensure comfortable playability for hours on end.",
    shortDescription:
      'A bold black electric guitar with a unique superhero logo, high-gloss finish, and powerful pickups.',
    price: 699,
    type: 'electric',
    tags: ['powerful', 'aggressive', 'rock', 'metal', 'high-energy', 'stage', 'bold'],
    features: ['Powerful pickups', 'High-gloss black finish', 'Ergonomic body', 'Superhero logo'],
    designHighlights: [
      'Powerful pickups deliver aggressive tones perfect for rock and metal',
      'High-gloss black finish provides striking stage presence',
      'Superhero logo adds bold character while maintaining professional aesthetics',
    ],
  },
  {
    id: 4,
    name: 'Motherboard Guitar',
    image: '/example-guitar-motherboard.jpg',
    description:
      "This guitar is a tribute to the motherboard of a computer. It's a unique and stylish instrument that will make you feel like a hacker. The intricate circuit-inspired design features actual LED lights that pulse with your playing intensity, while the neck is inlaid with binary code patterns that glow under stage lights. Each pickup has been custom-wound to produce tones ranging from clean digital precision to glitched-out distortion, perfect for electronic music fusion. The Motherboard Guitar seamlessly bridges the gap between traditional craftsmanship and cutting-edge technology, making it the ultimate instrument for the digital age musician.",
    shortDescription:
      'A tech-inspired electric guitar featuring LED lights and binary code inlays that glow under stage lights.',
    price: 649,
    type: 'electric',
    tags: ['tech', 'futuristic', 'electronic', 'modern', 'unique', 'experimental', 'digital'],
    features: ['LED lights', 'Binary code inlays', 'Custom-wound pickups', 'Circuit-inspired design'],
    designHighlights: [
      'LED lights pulse with playing intensity creating a dynamic visual performance',
      'Binary code inlays glow under UV stage lighting for futuristic aesthetics',
      'Custom-wound pickups produce both clean digital tones and glitched distortion',
    ],
  },
  {
    id: 5,
    name: 'Racing Guitar',
    image: '/example-guitar-racing.jpg',
    description:
      "Engineered for speed and precision, the Racing Guitar embodies the spirit of motorsport in every curve and contour. Its aerodynamic body, painted in classic racing stripes and high-gloss finish, is crafted from lightweight materials that allow for effortless play during extended performances. The custom low-action setup and streamlined neck profile enable lightning-fast fretwork, while specially designed pickups deliver a high-octane tone that cuts through any mix. Built with performance-grade hardware including racing-inspired control knobs and checkered flag inlays, this guitar isn't just played—it's driven to the limits of musical possibility.",
    shortDescription:
      'A lightweight, aerodynamic guitar with racing stripes and a low-action setup designed for speed and precision.',
    price: 679,
    type: 'electric',
    tags: ['fast', 'precision', 'lightweight', 'performance', 'speed', 'shred', 'metal'],
    features: ['Lightweight body', 'Low-action setup', 'Racing stripes', 'Checkered flag inlays'],
    designHighlights: [
      'Lightweight construction reduces fatigue during extended shredding sessions',
      'Low-action setup enables lightning-fast fretwork and technical playing',
      'Racing-inspired aesthetics and hardware create unique motorsport character',
    ],
  },
  {
    id: 6,
    name: 'Steamer Trunk Guitar',
    image: '/example-guitar-steamer-trunk.jpg',
    description:
      'The Steamer Trunk Guitar is a semi-hollow body instrument that exudes vintage charm and character. Crafted from reclaimed antique luggage wood, it features brass hardware that adds a touch of elegance and durability. The fretboard is adorned with a world map inlay, making it a unique piece that tells a story of travel and adventure.',
    shortDescription:
      'A semi-hollow body guitar with brass hardware and a world map inlay, crafted from reclaimed antique luggage wood.',
    price: 629,
    type: 'electric',
    tags: ['vintage', 'warm', 'jazz', 'blues', 'mellow', 'classic', 'travel'],
    features: ['Semi-hollow body', 'Brass hardware', 'World map inlay', 'Reclaimed wood'],
    designHighlights: [
      'Reclaimed antique luggage wood brings unique tonal character and sustainability',
      'Semi-hollow construction provides warm, resonant jazz and blues tones',
      'World map inlay tells a story of global adventure and travel',
    ],
  },
  {
    id: 7,
    name: "Travelin' Man Guitar",
    image: '/example-guitar-traveling.jpg',
    description:
      "The Travelin' Man Guitar is an acoustic masterpiece adorned with vintage postcards from around the world. Each postcard tells a story of adventure and wanderlust, making this guitar a unique piece of art. Its rich, resonant tones and comfortable playability make it perfect for musicians who love to travel and perform.",
    shortDescription:
      'An acoustic guitar with vintage postcards, rich tones, and comfortable playability.',
    price: 499,
    type: 'acoustic',
    tags: ['travel', 'folk', 'singer-songwriter', 'warm', 'storytelling', 'vintage', 'acoustic'],
    features: ['Vintage postcard artwork', 'Rich resonant tones', 'Comfortable neck', 'Travel-inspired design'],
    designHighlights: [
      'Vintage postcards from around the world create a unique piece of functional art',
      'Rich, resonant acoustic tones perfect for intimate storytelling performances',
      'Comfortable neck profile enables extended playing sessions on the road',
    ],
  },
  {
    id: 8,
    name: 'Flowerly Love Guitar',
    image: '/example-guitar-flowers.jpg',
    description:
      "The Flowerly Love Guitar is an acoustic masterpiece adorned with intricate floral designs on its body. Each flower is hand-painted, adding a touch of nature's beauty to the instrument. Its warm, resonant tones make it perfect for both intimate performances and larger gatherings.",
    shortDescription:
      'An acoustic guitar with hand-painted floral designs and warm, resonant tones.',
    price: 599,
    type: 'acoustic',
    tags: ['warm', 'romantic', 'folk', 'soft', 'intimate', 'nature', 'artistic'],
    features: ['Hand-painted florals', 'Warm resonant tones', 'Artistic body', 'Nature-inspired design'],
    designHighlights: [
      'Hand-painted florals make each guitar a one-of-a-kind work of art',
      'Warm acoustic tones create intimate, romantic atmosphere',
      'Nature-inspired design brings organic beauty to performance',
    ],
  },
]

export default guitars

// Helper function to get guitar by ID
export function getGuitarById(id: number): Guitar | undefined {
  return guitars.find((g) => g.id === id)
}

// Helper function to get guitars by type
export function getGuitarsByType(type: GuitarType): Guitar[] {
  return guitars.filter((g) => g.type === type)
}

// Helper function to get price range
export function getPriceRange(): { min: number; max: number } {
  const prices = guitars.map((g) => g.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

// Get all unique tags
export function getAllTags(): string[] {
  const tags = new Set<string>()
  guitars.forEach((g) => g.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}
