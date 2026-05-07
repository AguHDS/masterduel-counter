/**
 * Card image optimization utilities
 * Provides helpers to serve appropriately sized images based on display context
 */

export type ImageSize = 'thumbnail' | 'full';

interface CardImageOptions {
  /**
   * Size variant to use
   * - 'thumbnail': Optimized for small displays (50-100px), ~10-20kb
   * - 'full': Original cropped image, for large displays (200px+), ~120-627kb
   */
  size?: ImageSize;
  
  /**
   * Custom thumbnail dimensions (only used when size='thumbnail')
   * Defaults to 100x100 if not specified
   */
  width?: number;
  height?: number;
}

/**
 * Get optimized card image URL based on display context
 * 
 * Use 'thumbnail' size for:
 * - Home page guide lists (74px images) - default 100x100
 * - Profile page sidebar guides (50px images) - default 100x100
 * - Ranking modal/popup (64px images) - default 100x100
 * - Guide grid listings (192px images) - use width: 200, height: 200
 * 
 * Use 'full' size for:
 * - Guide headers (very large)
 * - Favorite deck editor (large display)
 * 
 * @param originalUrl - The original cropped image URL from backend
 * @param options - Configuration for image size optimization
 * @returns Optimized image URL
 * 
 * @example
 * ```tsx
 * // For small displays (home page, profile sidebar)
 * <img src={getOptimizedCardImageUrl(guide.headerCardImageUrl, { size: 'thumbnail' })} />
 * 
 * // For large displays (guide grid)
 * <img src={getOptimizedCardImageUrl(guide.headerCardImageUrl, { size: 'full' })} />
 * 
 * // Custom thumbnail size
 * <img src={getOptimizedCardImageUrl(guide.headerCardImageUrl, { 
 *   size: 'thumbnail', 
 *   width: 150, 
 *   height: 150 
 * })} />
 * ```
 */
export function getOptimizedCardImageUrl(
  originalUrl: string | null | undefined,
  options: CardImageOptions = {}
): string | undefined {
  if (!originalUrl) {
    return undefined;
  }

  const { size = 'full', width = 100, height = 100 } = options;

  // If full size requested, return original URL
  if (size === 'full') {
    return originalUrl;
  }

  // For thumbnail size, convert URL to thumbnail endpoint
  // Original URL format: {backend}/api/uploads/cards/{cardId}_cropped.jpg
  // Thumbnail URL format: {backend}/api/uploads/cards/thumb/{cardId}_{width}x{height}.jpg
  
  // Extract card ID from original URL
  const match = originalUrl.match(/\/(\d+)_cropped\.jpg$/);
  
  if (!match) {
    // If URL doesn't match expected format, return original
    console.warn(`Unexpected card image URL format: ${originalUrl}`);
    return originalUrl;
  }

  const cardId = match[1];
  const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/'));
  
  // Construct thumbnail URL
  return `${baseUrl}/thumb/${cardId}_${width}x${height}.jpg`;
}

/**
 * Type guard to check if a URL is already a thumbnail URL
 */
export function isThumbnailUrl(url: string): boolean {
  return url.includes('/thumb/');
}

/**
 * Get the appropriate image size based on display dimensions
 * Helps automatically choose between thumbnail and full size
 * 
 * @param displayWidth - Width in pixels that the image will be displayed at
 * @returns Recommended size variant
 */
export function getRecommendedImageSize(displayWidth: number): ImageSize {
  // Use thumbnail for displays under 120px
  // Use full for displays 120px and above
  return displayWidth < 120 ? 'thumbnail' : 'full';
}

/**
 * Cloudinary profile picture optimization
 * Applies appropriate transformations for different display contexts
 */
export type ProfilePictureSize = 'mini' | 'small' | 'medium' | 'large';

interface ProfilePictureOptions {
  /**
   * Size variant to use
   * - 'mini': For navbar, trending achievements (40-50px), very optimized
   * - 'small': For small avatars (80-100px), moderately optimized
   * - 'medium': For profile pages (150-200px), balanced optimization
   * - 'large': For large displays (300px+), minimal optimization
   */
  size?: ProfilePictureSize;
}

/**
 * Optimize Cloudinary profile picture URL with appropriate transformations
 * 
 * @param url - Original Cloudinary URL
 * @param options - Optimization options
 * @returns Optimized Cloudinary URL with transformations
 * 
 * @example
 * ```tsx
 * // For navbar (mini)
 * <img src={getOptimizedProfilePictureUrl(profileUrl, { size: 'mini' })} />
 * 
 * // For profile page (medium)
 * <img src={getOptimizedProfilePictureUrl(profileUrl, { size: 'medium' })} />
 * ```
 */
export function getOptimizedProfilePictureUrl(
  url: string | null | undefined,
  options: ProfilePictureOptions = {}
): string | undefined {
  if (!url) {
    return undefined;
  }

  // Only process Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  const { size = 'medium' } = options;

  // Define transformations for each size
  const transformations: Record<ProfilePictureSize, string> = {
    mini: 'w_50,h_50,c_fill,q_auto:low,f_auto',
    small: 'w_100,h_100,c_fill,q_auto,f_auto',
    medium: 'w_250,h_250,c_fill,q_auto:good,f_auto',
    large: 'w_400,h_400,c_fill,q_auto:good,f_auto',
  };

  const transform = transformations[size];

  // Insert transformation into Cloudinary URL
  return url.replace('/upload/', `/upload/${transform}/`);
}
