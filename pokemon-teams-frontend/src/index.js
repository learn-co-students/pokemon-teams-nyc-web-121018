const BASE_URL = "http://localhost:3000"
const TRAINERS_URL = `${BASE_URL}/trainers`
const POKEMONS_URL = `${BASE_URL}/pokemons`
const main = document.querySelector('.container')  // container where all trainers will be placed after the trainer fetch

let allTrainers = []      // local variable to hold all trainers after trainer fetch
let foundTrainer          // local variable to hold one instance of a trainer when a user clicks on the DOM

// DOMContentLoaded to prevent listeners from listeing until all content is painted to DOM
document.addEventListener("DOMContentLoaded", function(event) {
  // fetch all trainer info
  getTrainers(TRAINERS_URL)

  // listen for clicks on 'Add Pokemon' and 'Release'
  main.addEventListener('click', e => {

    // if user clicks 'Add Pokemon' then find trainer and make getSinglePokemon fetch request
    // as long as user has less than 6 pokemon
    if (e.target.innerText === "Add Pokemon") {
      foundTrainer = findTrainer(e.target.dataset.trainerId)
      if (foundTrainer.pokemons.length < 6) {
        getSinglePokemon(POKEMONS_URL, foundTrainer)
      }
    }

    // if user clicks 'Release' optimistically render the release and make the DELETE fetch request
    if (e.target.innerText === "Release") {
      e.target.parentElement.remove()
      releasePokemon(`${POKEMONS_URL}/${e.target.dataset.pokemonId}`)
    }
  })


}) // end DOMContentLoaded


// --------------------------- FETCH -------------------------------------------

// initial fetch to get all trainers
function getTrainers(url) {
  const main = document.querySelector('.container')
  fetch(url)
    .then(resp => resp.json())
    .then(trainers => {
      allTrainers = trainers        // set local variable equal to the response
      main.innerHTML = renderTrainerHTML(allTrainers)         // update DOM with all trainers pesimistically
    })
}

// fetch request called when a user clicks the 'Add Pokemon' button (if they have less than 6 pokemon)
function getSinglePokemon(url, trainer) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      trainer_id: trainer.id
    })
  })
    .then(resp => resp.json())
    .then(pokemon => {
      trainer.pokemons.push(pokemon)                                    // update local variable
      let trainerUl = document.getElementById(`trainer${trainer.id}`)   // find current trainers ul of pokemon
      trainerUl.innerHTML = createTrainerPokemonListItems(trainer)      // update just one users pokemon list
    })
}

// Fetch for the DELETE -- when a user clicks to 'Release' a pokemon
function releasePokemon(url) {
  fetch(url, {
    method: "DELETE"
  })
}

// --------------------------- Create HTML for trainers ------------------------

// creates a trainers LIs for their UL
function createTrainerPokemonListItems(trainer) {
  return trainer.pokemons.map(pokemon => {
    return `<li>${pokemon.nickname} (${pokemon.species}) <button class="release" data-pokemon-id="${pokemon.id}" >Release</button></li>`
  }).join("")
}

// Renders all HTML for a trainer
function renderTrainerHTML(trainers) {
  return trainers.map( trainer => {
    return `<div class="card" data-id="${trainer.id}"><p>${trainer.name}</p>
              <button data-trainer-id="${trainer.id}">Add Pokemon</button>
              <ul id="trainer${trainer.id}"> ${createTrainerPokemonListItems(trainer)} </ul>
            </div>`
  }).join("")
}

// finds a trainer based on their individual ID 
function findTrainer(id) {
  return allTrainers.find( trainer => trainer.id === parseInt(id))
}
