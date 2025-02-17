const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { charactersUrl } = JSON.parse(event.body);
    if (!charactersUrl) throw new Error("No character URL provided.");

    const apikey = process.env.VITE_PUBLIC_KEY;
    const timestamp = Date.now().toString();
    const hash = require("crypto-js/md5")(timestamp + process.env.VITE_PRIVATE_KEY + apikey).toString();

    const response = await fetch(`${charactersUrl}?apikey=${apikey}&ts=${timestamp}&hash=${hash}`);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.data.results),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
