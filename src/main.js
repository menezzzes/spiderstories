import CryptoJS from 'crypto-js';

const apikey = import.meta.env.VITE_PUBLIC_KEY;
const privateKey = import.meta.env.VITE_PRIVATE_KEY;
const timestamp = Date.now().toString();
const hash = CryptoJS.MD5(timestamp + privateKey + apikey).toString();

//spider-man IDs (there are multiple spider-men codes)
const characterIds = ["1009610", "1016181", "1017603"]; // Peter Parker, Miles Morales, Spider-Gwen

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


// this function fetches all stories in parallel and pick a random one with a description
async function fetchRandomStory() {
  try {
    showLoading();
    storyDescriptionElement.innerHTML = '';
    charactersList.innerHTML = '';

    const fetchPromises = characterIds.map(characterId =>
      fetch(`https://gateway.marvel.com/v1/public/characters/${characterId}/stories?apikey=${apikey}&ts=${timestamp}&hash=${hash}`)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
    );

    const responses = await Promise.all(fetchPromises);
    let allStories = responses.flatMap(response => response.data.results);
    let validStories = allStories.filter(story => story.description && story.description.trim() !== '');

    if (validStories.length === 0) {
      throw new Error('No stories with descriptions found.');
    }

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
    const urlWithAuth = `${charactersUrl}?apikey=${apikey}&ts=${timestamp}&hash=${hash}`;
    const charactersResponse = await fetch(urlWithAuth);
    if (!charactersResponse.ok) throw new Error(`HTTP error! Status: ${charactersResponse.status}`);

    const charactersData = await charactersResponse.json();
    const characters = charactersData.data.results;
    if (!characters || characters.length === 0) throw new Error('No characters found.');

    //container for the title and characters list
    charactersList.innerHTML = `
      <div class="characters-container">
        <h1>meet the characters:</h1>
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
