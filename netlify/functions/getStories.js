const fetch = require("node-fetch");
const CryptoJS = require("crypto-js");

exports.handler = async function (event) {
  try {
    const { characterIds } = JSON.parse(event.body);
    if (!characterIds) throw new Error("No character IDs provided.");

    const apikey = process.env.VITE_PUBLIC_KEY;
    const privateKey = process.env.VITE_PRIVATE_KEY;
    const timestamp = Date.now().toString();
    const hash = CryptoJS.MD5(timestamp + privateKey + apikey).toString();

    const fetchPromises = characterIds.map(async (characterId) => {  // Add async keyword here
      try {
        const response = await fetch(`https://gateway.marvel.com/v1/public/characters/${characterId}/stories?apikey=${apikey}&ts=${timestamp}&hash=${hash}`);
        if (!response.ok) {
          const errorText = await response.text(); // Get the error message from the API
          throw new Error(`Marvel API error: ${response.status} - ${errorText}`); // Throw a more informative error
        }
        return await response.json(); // Only parse JSON if the response is OK
      } catch (innerError) {
        console.error("Error fetching story for character", characterId, innerError); // Log the inner error
        return { data: { results: [] } }; // Return an empty result so Promise.all doesn't reject
      }
    });

    const responses = await Promise.all(fetchPromises);
    let allStories = responses.flatMap(res => res.data.results);
    let validStories = allStories.filter(story => story.description && story.description.trim() !== '');

    return {
      statusCode: 200,
      body: JSON.stringify(validStories),
    };
  } catch (error) {
    console.error("Main function error:", error); // Log the outer error
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};