exports.handler = async function (event) {
  try {
    const { charactersUrl } = JSON.parse(event.body);
    if (!charactersUrl) throw new Error("No character URL provided.");

    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const CryptoJS = await import('crypto-js');

    const apikey = process.env.VITE_PUBLIC_KEY;
    const privateKey = process.env.VITE_PRIVATE_KEY;
    const timestamp = Date.now().toString();
    const hash = CryptoJS.MD5(timestamp + privateKey + apikey).toString();

    const response = await fetch(`${charactersUrl}?apikey=${apikey}&ts=${timestamp}&hash=${hash}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Marvel API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.data.results),
    };
  } catch (error) {
    console.error("Error in character fetch:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};