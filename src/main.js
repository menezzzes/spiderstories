const apikey = import.meta.env.VITE_PUBLIC_KEY; // Only public key is exposed
const characterIds = ["1009610", "1016181", "1017603"]; // Spider-Man IDs

const storyDescriptionElement = document.getElementById('story-description');
const charactersList = document.getElementById('characters-list');

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
    console.error('Error fetching random story:', error);
    storyDescriptionElement.innerHTML = `<p style="color: red;">Failed to load a valid story. Please try again.</p>`;
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
    console.error('Error fetching characters:', error);
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
