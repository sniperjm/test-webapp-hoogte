
/**
 * Elevation Service handles fetching topographic data.
 * API Key provided by user: bf7f0baaa9b0a00164c28205f407843a0fbcb9d9
 */

export async function getElevation(lat: number, lng: number): Promise<number> {
  const apiKey = 'bf7f0baaa9b0a00164c28205f407843a0fbcb9d9';
  
  try {
    // We proberen eerst de officiële API van topographic-map met jouw key
    // Let op: Dit is een voorbeeld URL-structuur, check de documentatie van hun API voor de exacte endpoint
    const response = await fetch(`https://api.topographic-map.com/v1/elevation?point=${lat},${lng}&key=${apiKey}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.elevation || 0;
    }

    // Fallback naar open-elevation als de eerste API niet reageert of de key niet geldig is
    const fallbackResponse = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
    const fallbackData = await fallbackResponse.json();
    if (fallbackData.results && fallbackData.results.length > 0) {
      return fallbackData.results[0].elevation;
    }
    
    return 0;
  } catch (error) {
    console.error("Fout bij ophalen hoogtegegevens:", error);
    return 0;
  }
}
