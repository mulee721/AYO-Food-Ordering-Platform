/**
 * Image resolver — converts old relative paths to correct public URLs
 * Handles both old 'assets/' paths and new '/images/' paths
 */
export function resolveImageUrl(path) {
  if (!path) return null

  // Already correct absolute public path
  if (path.startsWith('/images/')) return path

  // Old assets path format — convert to /images/
  if (path.startsWith('assets/images/')) {
    return '/' + path
  }

  // Relative path like "../assets/..." — extract the filename
  if (path.includes('images/')) {
    const match = path.match(/images\/([^/]+\/)?(.+)/)
    if (match) {
      const subdir = match[1] ? match[1].replace(/\/$/, '') : 'dishes'
      return `/images/${subdir}/${match[2]}`
    }
  }

  // If all else fails, assume it's a dish or return as-is
  return path.startsWith('/') ? path : `/images/dishes/${path}`
}

/**
 * Get fallback image for a category or type
 */
export function getFallbackImage(category) {
  const fallbacks = {
    'Ethiopian Cuisine': '/images/categories/ethiopian.jpg',
    'Burgers': '/images/categories/burgers.jpg',
    'Pizza': '/images/categories/pizza.jpg',
    'Chicken': '/images/categories/chicken.jpg',
    'Vegetarian': '/images/categories/healthy.jpg',
    'Drinks': '/images/categories/drinks.jpg',
    'Pasta': '/images/categories/pasta.jpg',
    'Snacks': '/images/categories/snacks.jpg',
  }
  return fallbacks[category] || '/images/categories/ethiopian.jpg'
}
