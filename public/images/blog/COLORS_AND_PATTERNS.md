# Color Palettes and Patterns Reference

## Color Schemes by Country

### Korea (Teal/Navy Theme)
- **Primary**: #1B4965 (Deep Teal Navy)
- **Secondary**: #2B5F87 (Lighter Teal)
- **Accent**: #16A085 (Bright Teal)
- **Brand Aligned**: Yes (LocalNomad primary brand color)

### Japan (Indigo/Purple Theme)
- **Primary**: #312E81 (Deep Indigo)
- **Secondary**: #5E35B1 (Purple)
- **Accent**: #7E57C2 (Light Purple)
- **Brand Distinction**: Vibrant purple for distinction

### Taiwan (Emerald/Green Theme)
- **Primary**: #065F46 (Deep Emerald)
- **Secondary**: #059669 (Emerald Green)
- **Accent**: #10B981 (Bright Green)
- **Brand Distinction**: Natural emerald for nature/growth

### China (Deep Red/Gold Theme)
- **Primary**: #7F1D1D (Deep Red)
- **Secondary**: #B91C1C (Bright Red)
- **Accent**: #DC2626 (Light Red)
- **Brand Distinction**: Traditional red for cultural significance

## Geometric Patterns

### 1. Circles
```
Nested circles in regular grid pattern
Size: 60x60px grid
Uses: Soft, inclusive feel
Opacity: 10-15% for subtlety
```

### 2. Hexagons
```
Regular hexagon shapes in grid
Size: 80x80px grid
Uses: Modern, technological feel
Opacity: 12% for subtlety
```

### 3. Diagonal Lines
```
45-degree rotated diagonal lines
Size: 40x40px grid with 45° rotation
Uses: Dynamic, forward movement
Opacity: 8% for subtlety
```

### 4. Dots
```
Small circular dots in regular grid
Size: 40x40px grid
Uses: Minimal, clean feel
Opacity: 10% for subtlety
```

### 5. Waves
```
Sine wave curves in repeating pattern
Size: 100x60px grid
Uses: Flowing, flexible feel
Opacity: 8-12% for subtlety
```

### 6. Grid
```
Angular grid lines in regular pattern
Size: 50x50px grid
Uses: Organized, structured feel
Opacity: 10% for subtlety
```

## Visual Elements

### Gradient Direction
- **Direction**: Top-left (0,0) to Bottom-right (100%,100%)
- **Effect**: Darker at top, lighter at bottom within country theme
- **Opacity**: Fully opaque (100%)

### Accent Circles
- **Circle 1**: Position (100, 80), radius 120px, opacity 8%
- **Circle 2**: Position (850, 420), radius 150px, opacity 6%
- **Color**: Accent color of theme
- **Effect**: Subtle depth and dimension

### Country Emoji
- **Position**: Center (480, 240)
- **Size**: 200px font-size
- **Opacity**: 15%
- **Effect**: Watermark-like, visible but not dominant

### Bottom Accent Bar
- **Position**: Bottom edge (y=480)
- **Length**: Full width (0 to 960)
- **Height**: 3px stroke-width
- **Color**: Accent color
- **Opacity**: 30%
- **Effect**: Polish and frame

## Design Principles

1. **Subtlety**: All patterns and accents use low opacity (6-15%) to avoid overwhelming content
2. **Consistency**: Each country theme is consistent across all blog posts
3. **Variety**: Six different patterns ensure visual interest across country group
4. **Readability**: Dark backgrounds ensure any overlaid text remains readable
5. **Accessibility**: High contrast between background and foreground elements
6. **Scalability**: SVG format scales perfectly at any resolution

## File Size Optimization

- **Average file size**: 1.3-1.5 KB per SVG
- **Format**: Optimized XML with minimal whitespace
- **Compression ready**: Can be further minified with tooling if needed
- **Total package**: 92 KB for all 22 files

## Usage in Blog

Each blog post should:
1. Reference the corresponding SVG by filename
2. Use the image as the hero/header image
3. Set width to full viewport or container width
4. Maintain 960:480 aspect ratio (2:1)
5. Display at top of blog post before title

Example implementation:
```html
<img 
  src="/images/blog/korea-ultimate-digital-nomad-guide.svg" 
  alt="Korea Ultimate Digital Nomad Guide Hero"
  className="w-full h-auto"
/>
```
