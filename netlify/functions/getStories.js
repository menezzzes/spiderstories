import fetch from 'isomorphic-fetch';  // Use isomorphic-fetch
import CryptoJS from 'crypto-js';

export const handler = async (event) => {
  try {
    const { characterIds } = JSON.parse(event.body);
    if (!characterIds) throw new Error("No character IDs provided.");

    const apikey = process.env.PUBLIC_KEY;  // Netlify env vars
    const privateKey = process.env.PRIVATE_KEY;
    const timestamp = Date.now().toString();
    const hash = CryptoJS.MD5(timestamp + privateKey + apikey).toString();

    const fetchPromises = characterIds.map(async (characterId) => {
      try {
        const response = await fetch(
          `https://gateway.marvel.com/v1/public/characters/${characterId}/stories?apikey=${apikey}&ts=${timestamp}&hash=${hash}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Marvel API error: ${response.status} - ${errorText}`);
        }
        return await response.json();
      } catch (innerError) {
        console.error("Error fetching story for character", characterId, innerError);
        return { data: { results: } };
      }
    });

    const responses = await Promise.all(fetchPromises);
    let allStories = responses.flatMap((res) => res.data.results);
    let validStories = allStories.filter(
      (story) => story.description && story.description.trim()!== ""
    );

    return {
      statusCode: 200,
      body: JSON.stringify(validStories),
    };
  } catch (error) {
    console.error("Main function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};