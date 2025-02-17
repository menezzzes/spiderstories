const apikey = import.meta.env.VITE_PUBLIC_KEY; // Only public key is exposed
const characterIds = ["1009610", "1016181", "1017603"]; // Spider-Man IDs

const storyDescriptionElement = document.getElementById('story-description');
const charactersList = document.getElementById('characters-list');

// 📌 INSERT handleError() FUNCTION HERE
function handleError(error) {
  const errorContainer = document.getElementById("error-message");

  if (!errorContainer) {
    console.error("Error: No error container found in the HTML.");
    return;
  }

  errorContainer.innerHTML = "";
  errorContainer.style.display = "block";
  errorContainer.style.backgroundColor = "red";
  errorContainer.style.color = "white";
  errorContainer.style.padding = "10px";
  errorContainer.style.margin = "10px 0";
  errorContainer.style.borderRadius = "5px";
  errorContainer.style.textAlign = "center";

  let errorMessage = "Something went wrong. Please try again.";

  if (error instanceof TypeError && error.message.includes("fetch")) {
    errorMessage = "Network error: Please check your internet connection.";
  } else if (error.message.includes("HTTP error")) {
    errorMessage = `Marvel API Error: ${error.message}`;
  } else {
    errorMessage = "Unexpected error: " + error.message;
  }

  // Display the error message
  errorContainer.innerHTML = `<p>${errorMessage}</p>`;

  // Add a retry button
  const retryButton = document.createElement("button");
  retryButton.innerText = "Retry";
  retryButton.style.marginTop = "10px";
  retryButton.style.padding = "8px 15px";
  retryButton.style.border = "none";
  retryButton.style.backgroundColor = "yellow";
  retryButton.style.color = "black";
  retryButton.style.cursor = "pointer";
  retryButton.style.fontWeight = "bold";
  retryButton.onclick = () => {
    errorContainer.style.display = "none";
    fetchRandomStory(); // Retry fetching a new story
  };

  errorContainer.appendChild(retryButton);
}

function showLoading() {
  document.getElementById('loading').classList.add('show-loading');
  document.getElementById('content').classList.remove('content-visible'); 
}

function hideLoading() {
  document.getElementById('loading').classList.remove('show-loading');
  document.getElementById('content').classList.add('content-visible'); 
}

async function fetchRandomStory() {
  try {
    showLoading();
    storyDescriptionElement.innerHTML = '';
    charactersList.innerHTML = '';

    // Call the secure Netlify function instead of Marvel API directly
    const response = await fetch("/.netlify/functions/getStories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterIds })
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const validStories = await response.json();
    if (validStories.length === 0) throw new Error('No stories with descriptions found.');

    const randomStory = validStories[Math.floor(Math.random() * validStories.length)];
    displayStory(randomStory);
  } catch (error) {
    handleError(error);
  } finally {
    hideLoading();
  }
}

function displayStory(story) {
  storyDescriptionElement.innerHTML = `
    <h2>${story.title}</h2>
    <p>${story.description}</p>
  `;

  fetchCharacters(story.characters.collectionURI);
}

async function fetchCharacters(charactersUrl) {
  try {
    // Call the backend function for characters instead of Marvel API directly
    const response = await fetch("/.netlify/functions/getCharacters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ charactersUrl })
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const characters = await response.json();
    if (!characters || characters.length === 0) throw new Error('No characters found.');

    charactersList.innerHTML = `
      <div class="characters-container">
        <h1>Meet the Characters:</h1>
        <ul id="character-items"></ul>
      </div>
    `;

    const characterItems = document.getElementById('character-items');

    characters.forEach((character) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img 
          class="lazy-image" 
          data-src="${character.thumbnail.path}.${character.thumbnail.extension}" 
          alt="${character.name}">
        <span>${character.name}</span>
      `;
      characterItems.appendChild(li);
    });

    lazyLoadImages();
  } catch (error) {
    handleError(error);
  }
}

function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('.lazy-image');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy-image');
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach((img) => observer.observe(img));
}

document.getElementById('btn').addEventListener('click', fetchRandomStory);
window.addEventListener('DOMContentLoaded', fetchRandomStory);
