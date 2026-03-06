# Neighborhood Expansion — Japan, Taiwan, China

## Context

The Korea neighborhood explorer is complete (13 neighborhoods across Seoul, Busan, Jeju). Now we add Japan (8), Taiwan (8), and China (8) neighborhoods using the exact same architecture.

**Reference**: `data/neighborhoods/korea.json` for data schema, `components/neighborhood/` for UI.

## Scope

1. Create 3 new JSON data files
2. Update data loader whitelist
3. Update page route (country whitelist + display names)
4. Fix hardcoded Korea map center → dynamic per country
5. Verify everything builds

---

## Step 1: Create `data/neighborhoods/japan.json`

Follow the exact schema from `korea.json`. The TypeScript interface is in `lib/types/neighborhood.ts`:

```typescript
interface Neighborhood {
  name: string;
  city: string;
  coordinates: [number, number]; // [lat, lng] — NOTE: Mapbox uses [lng, lat] so component reverses these
  rent: string;
  vibe: string;
  pros: string[];
  cons: string[];
  walkability: number | null;
  safety: number | null;
  tags: string[];
  imageUrl: string | null;
}
```

### Japan — 4 cities, 8 neighborhoods

**Tokyo (4 neighborhoods):**

1. **Shibuya (渋谷)**
   - Coordinates: `[35.6620, 139.7036]`
   - Rent: ¥120,000–¥180,000/month (1R-1K apartment)
   - Vibe: Tech hub, startup scene, fast-paced, excellent transit
   - Tags: `["tech", "nightlife", "trendy", "central"]`
   - Walkability: 9, Safety: 8
   - Pros: Major tech company offices, World-class transit (6 train lines at Shibuya Station), Endless dining and entertainment, Strong coworking scene (WeWork and major chains)
   - Cons: Expensive, Very crowded especially around station, Noisy in commercial areas, Small apartment sizes

2. **Shimokitazawa (下北沢)**
   - Coordinates: `[35.6613, 139.6680]`
   - Rent: ¥80,000–¥140,000/month
   - Vibe: Indie, vintage shops, live music, bohemian, walkable village feel
   - Tags: `["hipster", "cafe", "creative", "budget"]`
   - Walkability: 8, Safety: 9
   - Pros: Affordable for central Tokyo, Unique indie cafe culture, Safe and walkable, Strong community feel, Just 1 stop from Shibuya (6 min via Keio Inokashira Line)
   - Cons: Limited coworking spaces, Narrow streets, Fewer English speakers, Far from business districts

3. **Nakameguro (中目黒)**
   - Coordinates: `[35.6440, 139.6989]`
   - Rent: ¥110,000–¥180,000/month
   - Vibe: Stylish, canal-side cafes, design-focused, quieter upscale
   - Tags: `["cafe", "trendy", "luxury", "quiet"]`
   - Walkability: 8, Safety: 9
   - Pros: Beautiful Meguro River area, High-quality cafes and restaurants, Quieter than Shibuya, Tokyu Toyoko Line and Hibiya Line access
   - Cons: Expensive, Limited nightlife, Fewer international amenities, Cherry blossom crowds in spring

4. **Asakusa (浅草)**
   - Coordinates: `[35.7148, 139.7967]`
   - Rent: ¥60,000–¥100,000/month
   - Vibe: Traditional, temple district, tourist-adjacent, old-town charm
   - Tags: `["budget", "local", "culture", "central"]`
   - Walkability: 8, Safety: 9
   - Pros: Among the most affordable central Tokyo areas, Rich cultural atmosphere, Good transit (4 lines: Ginza, Toei Asakusa, Tobu Skytree, Tsukuba Express), Authentic local dining
   - Cons: Very touristy around Senso-ji, Older building stock, Fewer modern amenities, Limited coworking

**Osaka (2 neighborhoods):**

5. **Namba (難波)**
   - Coordinates: `[34.6656, 135.5013]`
   - Rent: ¥70,000–¥120,000/month
   - Vibe: Street food capital, vibrant nightlife, Dotonbori energy, loud and fun
   - Tags: `["food", "nightlife", "central", "budget"]`
   - Walkability: 9, Safety: 8
   - Pros: More affordable than Tokyo city centers, Best street food scene, Excellent transit hub (Nankai, Midosuji, Kintetsu), Friendly locals
   - Cons: Touristy around Dotonbori, Noisy at night, Fewer coworking spaces than Tokyo, Smaller international community

6. **Umeda (梅田)**
   - Coordinates: `[34.7024, 135.4959]`
   - Rent: ¥60,000–¥100,000/month
   - Vibe: Business district, modern, department stores, Osaka's corporate center
   - Tags: `["corporate", "central", "networking", "mid-range"]`
   - Walkability: 8, Safety: 9
   - Pros: Major business hub with coworking options, 6-min subway to Shin-Osaka (Shinkansen access via Midosuji Line), Modern apartments, Underground shopping complex
   - Cons: Corporate atmosphere, Less character than Namba, Expensive for Osaka, Quiet on weekends

**Fukuoka (1 neighborhood):**

7. **Tenjin (天神)**
   - Coordinates: `[33.5902, 130.3990]`
   - Rent: ¥40,000–¥70,000/month
   - Vibe: Startup-friendly, compact city center, yatai food stalls, beach accessible
   - Tags: `["startup", "food", "budget", "community"]`
   - Walkability: 9, Safety: 9
   - Pros: Japan's startup capital (Startup Visa program), Very affordable, Compact and walkable, Fukuoka Growth Next coworking hub, Fukuoka Airport 11 min by subway (5 stops via Kuko Line)
   - Cons: Smaller international community, Fewer direct international flights, Limited English, Typhoon season (summer)

**Kyoto (1 neighborhood):**

8. **Gion / Higashiyama (祇園・東山)**
   - Coordinates: `[35.0036, 135.7747]`
   - Rent: ¥55,000–¥95,000/month
   - Vibe: Historic, temples, traditional machiya townhouses, serene, artistic
   - Tags: `["culture", "quiet", "nature", "cafe"]`
   - Walkability: 7, Safety: 9
   - Pros: Unmatched cultural immersion, Beautiful temples and gardens, Growing cafe scene, Quiet work environment, Keihan Line access
   - Cons: Tourist crowds (especially spring and fall), Limited nightlife, Fewer coworking spaces, Hot and humid summers, Cold winters

---

## Step 2: Create `data/neighborhoods/taiwan.json`

### Taiwan — 4 cities, 8 neighborhoods

**Taipei (5 neighborhoods):**

1. **Da'an (大安區)**
   - Coordinates: `[25.0268, 121.5436]`
   - Rent: NT$22,000–NT$35,000/month
   - Vibe: Tree-lined streets, university area, expat favorite, premium cafes
   - Tags: `["expat", "cafe", "central", "luxury"]`
   - Walkability: 9, Safety: 9
   - Pros: Highest concentration of cafes and coworking, MRT Da'an Station (Red + Brown Lines), Strong expat community, Daan Forest Park for breaks
   - Cons: Most expensive district in Taipei, Competitive apartment market, Can feel overly gentrified, Crowded cafes on weekends

2. **Xinyi (信義區)**
   - Coordinates: `[25.0330, 121.5654]`
   - Rent: NT$25,000–NT$40,000/month
   - Vibe: Modern, Taipei 101, luxury malls, corporate, nightlife
   - Tags: `["luxury", "corporate", "nightlife", "central"]`
   - Walkability: 8, Safety: 9
   - Pros: Taipei's most modern district, Premium coworking (WeWork, JustCo), City Hall Station (Blue Line) and Taipei 101 Station (Red Line), Active nightlife scene
   - Cons: Most expensive area, Corporate atmosphere during day, Less local character, Mall-centric culture

3. **Zhongshan (中山區)**
   - Coordinates: `[25.0528, 121.5220]`
   - Rent: NT$16,000–NT$25,000/month
   - Vibe: Art galleries, boutique hotels, Japanese-era architecture, refined
   - Tags: `["creative", "mid-range", "cafe", "culture"]`
   - Walkability: 9, Safety: 9
   - Pros: Great balance of price and quality, Gallery and design scene, Excellent MRT access (Red + Green Lines at Zhongshan Station), Quieter than Da'an
   - Cons: Some areas feel commercial, Tourist-heavy near Zhongshan station, Limited nightlife, Older apartments

4. **Yongkang Street Area (永康街)**
   - Coordinates: `[25.0302, 121.5296]`
   - Rent: NT$18,000–NT$28,000/month
   - Vibe: Foodie paradise, cozy lanes, neighborhood feel near original Din Tai Fung (on nearby Xinyi Road)
   - Tags: `["food", "local", "cafe", "trendy"]`
   - Walkability: 9, Safety: 9
   - Pros: Best food scene in Taipei, Walkable charming streets, Dongmen Station (Red + Orange Lines), Strong cafe culture, Close to Da'an Park
   - Cons: Touristy around main strip, Small apartment sizes, Noisy restaurant streets, Rising rents

5. **Ximending (西門町)**
   - Coordinates: `[25.0421, 121.5081]`
   - Rent: NT$14,000–NT$22,000/month
   - Vibe: Youth culture, street art, LGBTQ+-friendly, Harajuku of Taipei, bustling
   - Tags: `["budget", "nightlife", "creative", "central"]`
   - Walkability: 9, Safety: 8
   - Pros: Most affordable central Taipei location, Vibrant street culture, Excellent MRT hub (Ximen Station — Blue + Green Lines), LGBTQ+-friendly area
   - Cons: Very crowded (especially weekends), Noisy, Touristy, Older building stock

**Taichung (1 neighborhood):**

6. **West District / Xitun (西區 / 西屯區)**
   - Coordinates: `[24.1522, 120.6466]`
   - Rent: NT$12,000–NT$18,000/month
   - Vibe: Emerging arts scene, spacious, relaxed pace
   - Tags: `["budget", "creative", "nature", "quiet"]`
   - Walkability: 6, Safety: 9
   - Pros: Very affordable compared to Taipei, Calligraphy Greenway cafes (West District), National Taichung Theater (Xitun District), Spacious apartments
   - Cons: Scooter/car needed for some areas, Smaller international community, Fewer coworking spaces, Hot summers

**Kaohsiung (1 neighborhood):**

7. **Yancheng (鹽埕區)**
   - Coordinates: `[22.6235, 120.2860]`
   - Rent: NT$8,000–NT$14,000/month
   - Vibe: Port city revival, street art, Pier-2 arts district, emerging creative hub
   - Tags: `["budget", "creative", "culture", "community"]`
   - Walkability: 7, Safety: 9
   - Pros: Cheapest option in this list, Pier-2 Art Center (5 min walk from Yanchengpu MRT), Light rail and MRT Orange Line access, Waterfront walks
   - Cons: Small international community, Limited English, Hot and humid year-round, Fewer cafes

**Tainan (1 neighborhood):**

8. **West Central District (中西區)**
   - Coordinates: `[22.9912, 120.2039]`
   - Rent: NT$10,000–NT$14,000/month
   - Vibe: Taiwan's oldest city, temple-lined streets, Taiwan's food capital, slow pace
   - Tags: `["food", "culture", "budget", "local"]`
   - Walkability: 7, Safety: 9
   - Pros: Cheapest living cost in Taiwan, Taiwan's food capital (not just "best outside Taipei"), Rich cultural heritage, Authentic local experience
   - Cons: Very limited English, Car or scooter recommended, Smallest international community, Fewer modern amenities

---

## Step 3: Create `data/neighborhoods/china.json`

### China — 4 cities, 8 neighborhoods

**Shanghai (3 neighborhoods):**

1. **Jing'an (静安区)**
   - Coordinates: `[31.2286, 121.4488]`
   - Rent: ¥6,000–¥12,000/month
   - Vibe: Central, mixed modern/heritage, Jing'an Temple area, business meets lifestyle
   - Tags: `["central", "luxury", "cafe", "networking"]`
   - Walkability: 9, Safety: 9
   - Pros: Premium location with excellent Metro access (Lines 2, 7, 14 at Jing'an Temple Station), Strong coworking scene (WeWork and major chains), Mix of international and local culture, Beautiful Jing'an Temple park
   - Cons: Expensive, Crowded during rush hours, Construction noise common, Can feel impersonal

2. **Former French Concession (原法租界 / Xuhui)**
   - Coordinates: `[31.2087, 121.4559]`
   - Rent: ¥7,000–¥12,000/month
   - Vibe: Tree-lined avenues, colonial architecture, brunch culture, expat hub
   - Tags: `["expat", "cafe", "hipster", "luxury"]`
   - Walkability: 9, Safety: 9
   - Pros: Most charming neighborhood in Shanghai, Best cafe and restaurant scene, Strong expat community, Walkable tree-lined streets, Hengshan Rd (Line 1) and Changshu Rd (Lines 1, 7) stations
   - Cons: Most expensive area, Gentrifying rapidly, Tourist crowds on weekends, Can feel like an expat bubble

3. **Pudong / Lujiazui (浦东 / 陆家嘴)**
   - Coordinates: `[31.2353, 121.5254]`
   - Rent: ¥8,000–¥15,000/month
   - Vibe: Financial district, modern towers, corporate, Bund views from the other side
   - Tags: `["corporate", "modern", "networking", "mid-range"]`
   - Walkability: 6, Safety: 9
   - Pros: Modern apartments with more space, Lujiazui Station (Line 2), Close to financial jobs, Century Park for greenery
   - Cons: Premium CBD pricing (comparable to central Puxi), Less character than Puxi, Spread out (Metro dependent), Fewer dining and nightlife options, Can feel sterile

**Beijing (2 neighborhoods):**

4. **Chaoyang (朝阳区)**
   - Coordinates: `[39.9219, 116.4431]`
   - Rent: ¥8,000–¥15,000/month
   - Vibe: Embassies, international, Sanlitun nightlife, 798 art district, sprawling
   - Tags: `["expat", "international", "nightlife", "creative"]`
   - Walkability: 6, Safety: 8
   - Pros: Largest international community in Beijing, 798 Art District, Sanlitun bar and restaurant scene, Guomao Station (Lines 1, 10), Many coworking options
   - Cons: Massive district (commute within Chaoyang can be long), Air quality concerns, Expensive around Sanlitun/CBD, Traffic congestion

5. **Haidian (海淀区)**
   - Coordinates: `[39.9590, 116.2983]`
   - Rent: ¥5,000–¥8,000/month
   - Vibe: University district, tech hub (Zhongguancun), young, intellectual
   - Tags: `["tech", "budget", "local", "community"]`
   - Walkability: 6, Safety: 9
   - Pros: China's Silicon Valley (Zhongguancun), University atmosphere (Peking, Tsinghua), Affordable, Zhongguancun Station (Line 4), Strong tech startup community
   - Cons: Far from central attractions, Less international, Air quality concerns, Fewer dining and nightlife options

**Shenzhen (2 neighborhoods):**

6. **Nanshan (南山区)**
   - Coordinates: `[22.5328, 113.9285]`
   - Rent: ¥4,000–¥8,000/month
   - Vibe: Tech capital of China, Tencent/DJI headquarters, young professionals, modern
   - Tags: `["tech", "startup", "modern", "community"]`
   - Walkability: 7, Safety: 9
   - Pros: China's top tech ecosystem, Young and dynamic atmosphere, Modern apartments, Sea World Station (Line 2), Shekou area has international community
   - Cons: Expensive for Shenzhen, Rapidly changing landscape, Less cultural heritage, Humid subtropical climate, Shekou–Hong Kong ferry currently suspended

7. **Futian (福田区)**
   - Coordinates: `[22.5466, 114.0545]`
   - Rent: ¥5,500–¥10,000/month
   - Vibe: CBD, convention center, cross-border to Hong Kong, business-focused
   - Tags: `["central", "corporate", "networking", "mid-range"]`
   - Walkability: 7, Safety: 9
   - Pros: Central business district, Direct train to Hong Kong (Futian Station), Shopping Park Station (Lines 1, 3) and Civic Center Station (Lines 2, 4), Modern infrastructure
   - Cons: Corporate atmosphere, Less character, Fewer independent cafes, Hot and humid climate

**Chengdu (1 neighborhood):**

8. **Jinli / Chunxi Road (锦里 / 春熙路)**
   - Coordinates: `[30.6587, 104.0657]`
   - Rent: ¥2,500–¥5,000/month
   - Vibe: Sichuan food capital, tea houses, panda city, laid-back lifestyle, emerging tech hub
   - Tags: `["food", "budget", "culture", "local"]`
   - Walkability: 8, Safety: 9
   - Pros: Most affordable major city in China, Best food scene (Sichuan cuisine), Extremely laid-back lifestyle, Chunxi Road Station (Lines 2, 3), Emerging tech hub in Sichuan province, Panda Base reachable by car/taxi (30-40 min from center)
   - Cons: Limited English, Humid basin climate, Fewer international amenities, Air quality moderate, Far from coast/borders

---

## Step 4: Update Data Loader

**File**: `lib/neighborhood-data.ts`

Change the `VALID_COUNTRIES` array:

```typescript
const VALID_COUNTRIES = ['korea', 'japan', 'taiwan', 'china'] as const;
```

No other changes needed — the dynamic import pattern `@/data/neighborhoods/${country}.json` already handles new countries.

---

## Step 5: Update Page Route

**File**: `app/[locale]/neighborhood/[country]/page.tsx`

### 5A. Update VALID_COUNTRIES:

```typescript
const VALID_COUNTRIES = ['korea', 'japan', 'taiwan', 'china'] as const;
```

### 5B. Update COUNTRY_DISPLAY:

```typescript
const COUNTRY_DISPLAY: Record<string, string> = {
  korea: 'South Korea',
  japan: 'Japan',
  taiwan: 'Taiwan',
  china: 'China',
};
```

---

## Step 6: Fix Hardcoded Map Center

**File**: `components/neighborhood/neighborhood-map.tsx`

The map is currently hardcoded to Korea's center:

```typescript
center: [127.5, 36.0], // Center of Korea [lng, lat]
zoom: 6,
```

This must be dynamic. The map already does `fitBounds` on load, so the simplest fix is to compute the center from the cities data:

### 6A. Compute initial center and zoom from cities prop

Replace the hardcoded center in the `useEffect` initialization block:

```typescript
// Compute center from all city coordinates
const avgLat = cities.reduce((sum, c) => sum + c.coordinates[0], 0) / cities.length;
const avgLng = cities.reduce((sum, c) => sum + c.coordinates[1], 0) / cities.length;

const map = new mapboxgl.Map({
  container: mapContainerRef.current,
  style: 'mapbox://styles/mapbox/light-v11',
  center: [avgLng, avgLat],  // Dynamic center from data
  zoom: 5,                    // Start zoomed out; fitBounds will adjust
  scrollZoom: false,
});
```

This works because:
- `fitBounds` fires immediately after and adjusts to the correct zoom
- The initial `center` is just a placeholder before `fitBounds` runs
- The average of all city coordinates gives a reasonable initial position for any country

### 6B. No changes to markers

The marker creation logic is already data-driven — it reads coordinates from the cities/neighborhoods arrays. No changes needed.

---

## Step 7: Verification

After all changes:

1. **Build**: `npm run build` — must succeed
2. **Lint**: `npm run lint` — must pass
3. **JSON validity**: All 3 new JSON files must be valid (no trailing commas)
4. **Data integrity check**: Run this verification:
   ```bash
   node -e "
     ['japan', 'taiwan', 'china'].forEach(c => {
       const d = require('./data/neighborhoods/' + c + '.json');
       const total = d.cities.reduce((s, city) => s + city.neighborhoods.length, 0);
       console.log(c + ': ' + d.cities.length + ' cities, ' + total + ' neighborhoods');
       d.cities.forEach(city => {
         city.neighborhoods.forEach(n => {
           if (!n.coordinates || n.coordinates.length !== 2) {
             console.error('BAD COORDS:', c, n.name);
           }
           if (!n.tags || n.tags.length === 0) {
             console.error('NO TAGS:', c, n.name);
           }
         });
       });
     });
   "
   ```
   Expected output:
   ```
   japan: 4 cities, 8 neighborhoods
   taiwan: 4 cities, 8 neighborhoods
   china: 4 cities, 8 neighborhoods
   ```
5. **Route check**: These URLs should all render (no 404):
   - `/en/neighborhood/japan`
   - `/en/neighborhood/taiwan`
   - `/en/neighborhood/china`
   - `/en/neighborhood/korea` (existing, must still work)
6. **Map rendering**: Each country should show city cluster markers at correct positions, not all stacked on Korea

---

## File Impact Summary

**New files** (3):
- `data/neighborhoods/japan.json`
- `data/neighborhoods/taiwan.json`
- `data/neighborhoods/china.json`

**Modified files** (3):
- `lib/neighborhood-data.ts` — Add countries to whitelist
- `app/[locale]/neighborhood/[country]/page.tsx` — Add countries + display names
- `components/neighborhood/neighborhood-map.tsx` — Dynamic map center

**Total**: 6 files (3 new, 3 modified)
