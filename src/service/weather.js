
const DEFAULT_LOC = "Nanchang,Jiangxi,China";

/**
 * Retrieves weather data for the specified location.
 * @param {...string} location - can be addresses, partial addresses or latitude,longitude values.
 * @returns {Promise<Object>} - A promise of json.
 * ---
 * @example
 * ```js
 * const weather = await getWeather('Nanchang', 'Jiangxi', 'China');
 * const weather2= await getWeather('22.3811236,114.2030336');
 * ```
 */
async function getWeather(...location) {
  // const data = await fetch('/src/service/fetch.json').then(res => res.json());
  // return data;

  try {
    if (location.length === 0) {
      location = [DEFAULT_LOC];
    }
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location.join(',')}?unitGroup=metric&key=FBN4SGAU8WUZLZ3M4HBF8XMGL&contentType=json`, {
      "method": "GET"
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export { getWeather };