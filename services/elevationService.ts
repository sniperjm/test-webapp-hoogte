/**
 * Elevation Service handles fetching topographic data using reliable open sources.
 */

export async function getElevation(lat: number, lng: number): Promise<number> {
  try {
    // Open-Meteo is zeer betrouwbaar en heeft geen API key nodig voor basisgebruik
    const response = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`,
      { method: 'GET', headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) throw new Error('Elevation API request failed');
    
    const data = await response.json();
    return data.elevation?.[0] || 0;
  } catch (error) {
    console.warn("Fout bij ophalen hoogtegegevens (Open-Meteo), probeer fallback:", error);
    
    try {
      // Fallback naar een alternatieve bron als Open-Meteo faalt
      const fallbackResponse = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
      const fallbackData = await fallbackResponse.json();
      return fallbackData.results?.[0]?.elevation || 0;
    } catch (e) {
      console.error("Alle hoogte-services gefaald:", e);
      return 0;
    }
  }
}