const fetch = require("node-fetch");
const CryptoJS = require("crypto-js");

exports.handler = async function (event) {
  try {
    // Parse the request body
    const { characterIds } = JSON.parse(event.body);
    if (!characterIds) throw new Error("No character IDs provided.");

    // Secure API authentication
    const apikey = process.env.VITE_PUBLIC_KEY;  // Safe to expose
    const privateKey = process.env.VITE_PRIVATE_KEY;  // Hidden from frontend
    const timestamp = Date.now().toString();
    const hash = CryptoJS.MD5(timestamp + privateKey + apikey).toString();

    // Fetch stories for all characters
    const fetchPromises = characterIds.map(characterId =>
      fetch(`https://gateway.marvel.com/v1/public/characters/${characterId}/stories?apikey=${apikey}&ts=${timestamp}&hash=${hash}`)
        .then(res => res.json())
    );

    const responses = await Promise.all(fetchPromises);
    let allStories = responses.flatMap(res => res.data.results);
    let validStories = allStories.filter(story => story.description && story.description.trim() !== '');

    return {
      statusCode: 200,
      body: JSON.stringify(validStories),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
