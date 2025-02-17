const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { charactersUrl } = JSON.parse(event.body);
    if (!charactersUrl) throw new Error("No character URL provided.");

    const apikey = process.env.VITE_PUBLIC_KEY;
    const privateKey = process.env.VITE_PRIVATE_KEY;
    const timestamp = Date.now().toString();
    const hash = require("crypto-js/md5")(timestamp + privateKey + apikey).toString(); // Use privateKey here

    const response = await fetch(`${charactersUrl}?apikey=${apikey}&ts=${timestamp}&hash=${hash}`);

    if (!response.ok) {
      const errorText = await response.text(); // Get the error text from API
      throw new Error(`Marvel API error: ${response.status} - ${errorText}`); // More informative error
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.data.results),
    };
  } catch (error) {
    console.error("Error in character fetch:", error); // Log the error for debugging
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }), // Send error message back to client
    };
  }
};