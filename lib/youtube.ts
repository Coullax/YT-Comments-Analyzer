export function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if the hostname is a valid YouTube domain
    const validDomains = ['youtube.com', 'www.youtube.com', 'youtu.be'];
    if (!validDomains.includes(hostname)) {
      return false;
    }

    // Check for video ID in different URL formats
    if (hostname === 'youtu.be') {
      // Short URL format: https://youtu.be/VIDEO_ID
      return urlObj.pathname.length > 1; // Must have something after the /
    } else {
      // Regular URL format: https://youtube.com/watch?v=VIDEO_ID
      const videoId = urlObj.searchParams.get('v');
      return videoId !== null && videoId.length > 0;
    }
  } catch {
    return false;
  }
}

export function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname === 'youtu.be') {
      // Short URL format
      return urlObj.pathname.slice(1) || null;
    } else {
      // Regular URL format
      return urlObj.searchParams.get('v');
    }
  } catch {
    return null;
  }
}

export default {
  isValidYouTubeUrl,
  extractVideoId
}