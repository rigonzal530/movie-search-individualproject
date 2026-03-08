/* =============== State Variables =============== */
let selectedMovie = null;
let totalPages = 0;
let currentPage = 1;
let currentSearch = "";
let isLoading = false; // tracks if a search request is currently in progress
let notificationTimer = null; // stores the timer ID for the user notification timeout, allowing it to be cleared if a new notification is shown before the previous one times out

/* =============== DOM Cache =============== */
let dom = {};

/* =============== API Constants =============== */
const OMDB_RESULTS_PER_PAGE = 10; // OMDb API returns 10 results per page, used to calculate total pages based on total results


/* =============== Initialization =============== */
document.addEventListener("DOMContentLoaded", () => {
    // cached DOM elements
    dom.userNotification = document.getElementById("userNotification");
    dom.userSearch = document.getElementById("userSearch");
    dom.cardContainer = document.getElementById("cardContainer");
    dom.searchResultsFeedback = document.getElementById("searchResultsFeedback");
    dom.loadMoreButton = document.getElementById("loadMore");
    dom.confirmSaveButton = document.getElementById("confirmSave");

    const movieDetailsModal = document.getElementById("movieDetailsModal");
    if (movieDetailsModal) {
        dom.movieModal = new bootstrap.Modal(movieDetailsModal);
        dom.movieModalElements = {
            title: document.getElementById("movieTitle"),
            poster: document.getElementById("moviePoster"),
            release: document.getElementById("movieRelease"),
            plot: document.getElementById("moviePlot"),
            rating: document.getElementById("movieRating"),
            id: document.getElementById("movieId")
        };
    }

    // event listeners
    const searchForm = document.getElementById("movieSearchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", handleSearchSubmit);
    }

    if (dom.cardContainer) {
        dom.cardContainer.addEventListener("click", handleCardClick);
    }

    if (dom.confirmSaveButton) {
        dom.confirmSaveButton.addEventListener("click", handleConfirmSave);
    }

    if (dom.loadMoreButton) {
        dom.loadMoreButton.addEventListener("click", handleLoadMore);
    }

});

/* =============== Event Handlers =============== */
function handleSearchSubmit(event) {
    event.preventDefault();
    startNewSearch();
}

function handleCardClick(event) {
    const card = event.target.closest(".movie-card");

    if (!card) return;

    const imdbId = card.dataset.imdbId; // each card has a data-imdb-id attribute with the movie's IMDb ID when created
    openMovieDetailsModal(imdbId);
}

function handleConfirmSave() {
    saveSelectedMovie();
}

function handleLoadMore() {
    getNextPage();
}

/* =============== Controllers =============== */
async function startNewSearch() {
    if (!dom.userSearch || !dom.cardContainer) return; // ensure necessary DOM elements are cached before trying to access them
    if (isLoading) return; // prevent starting a new search while one is already in progress

    const userSearch = dom.userSearch.value.trim();
    const cardContainer = dom.cardContainer;

    if (!userSearch) return; // prevent searching with an empty query

    // resets state when a new search is performed
    selectedMovie = null; 
    currentPage = 1;
    currentSearch = userSearch;
    totalPages = 0;
    cardContainer.innerHTML = "";

    await getNextPage();
}

async function getNextPage() {
    if (isLoading) return;
    if (!currentSearch) return;
    if (currentPage > totalPages && totalPages !== 0) return;

    isLoading = true; // set loading state to prevent multiple requests
    updateLoadMoreButton();
    
    try {
        const data = await fetchMovieSearchResults(currentSearch, currentPage);

        if (totalPages === 0) {
            totalPages = Math.ceil((data.totalResults || 0) / OMDB_RESULTS_PER_PAGE); // calculate total pages based on total results
        }

        renderMovies(data.results);
        currentPage++; 
    }
    catch (error) {
        console.log("Network error:", error);
        showNotification("Unable to connect. Please check your network connection and try again.", "warning", 6000);
    }
    finally {
        isLoading = false; // reset loading state after request completes
        updateLoadMoreButton();
    }
}

async function openMovieDetailsModal(imdbId) {
    try {
        const movieDetails = await fetchMovieDetails(imdbId);
        selectedMovie = movieDetails; // store the selected movie's data in the global variable

        renderMovieDetails(movieDetails);
    }
    catch (error) {
        console.log("Error fetching movie details:", error);
        showNotification("Unable to fetch movie details. Please try again later.", "warning", 6000);
    }
}

async function saveSelectedMovie() {
    if (!dom.confirmSaveButton || !dom.movieModal) return; // ensure the confirm save button and movie modal are cached before trying to access them
    if (!selectedMovie) return; // ensure there's a selected movie to save
    
    const movieModal = dom.movieModal;
    const confirmSaveButton = dom.confirmSaveButton;
    confirmSaveButton.disabled = true; // disable the save button to prevent multiple clicks while the save is in progress

    try {
        const savedMovie = await saveMovie(selectedMovie.imdbID);
        if (savedMovie.alreadyExisted) {
            showNotification(`${selectedMovie.Title} is already in your collection!`, "warning");
        }
        else {
            showNotification(`${selectedMovie.Title} saved to your collection!`, "success");
        }

        movieModal.hide(); // close the modal after saving
        selectedMovie = null; // reset selected movie after saving
    }
    catch (error) {
        console.log("Error saving movie:", error);
        showNotification("Unable to save movie. Please try again later.", "warning", 6000);
    }
    finally {
        confirmSaveButton.disabled = false; // re-enable the save button after the save attempt completes
    }
}

/* =============== API Calls =============== */
async function fetchMovieSearchResults(search, page) {
    const response = await fetch(`/api/movies/search?search=${encodeURIComponent(search)}&page=${page}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "OMDb API request failed");
    }

    return data;
}

async function fetchMovieDetails(imdbId) {
    const response = await fetch(`/api/movies/${encodeURIComponent(imdbId)}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch movie details");
    }

    return data;
}

async function saveMovie(imdbId) {
    const response = await fetch(`/api/movies/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            imdbId: imdbId
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to save movie");
    }

    return data;
}

/* =============== Rendering =============== */
function renderMovies(movies) {
    if (!dom.cardContainer || !dom.searchResultsFeedback) return;

    const cardContainer = dom.cardContainer;
    const searchResultsFeedback = dom.searchResultsFeedback;

    if (!movies || (movies.length === 0 && currentPage === 1)) {
        searchResultsFeedback.textContent = "No results found. Try searching for another title.";
        searchResultsFeedback.classList.remove("d-none");
        return;
    }
    
    searchResultsFeedback.classList.add("d-none");

    for (const movie of movies) {
        cardContainer.append(createMovieCard(movie));
    }
}

function renderMovieDetails(movie) {
    if (!dom.movieModal || !dom.movieModalElements) return; // ensure the modal has been cached before trying to render details

    const { title, poster, release, plot, rating, id } = dom.movieModalElements;
    title.textContent = movie.Title;

    poster.src = movie.Poster !== "N/A" ? movie.Poster : "/images/posterPlaceholder.png";
    poster.alt = `Poster for ${movie.Title}`;
    poster.loading = "lazy";
    poster.onerror = () => {
        poster.onerror = null; // prevent infinite loop if placeholder image also fails to load
        poster.src = "/images/posterPlaceholder.png"; 
    };

    release.textContent = `Release Date: ${movie.Released}`;
    plot.textContent = movie.Plot;
    rating.textContent = `IMDb Rating: ${movie.imdbRating}`;
    id.textContent = `IMDb ID: ${movie.imdbID}`;
    
    dom.movieModal.show();
}

/* =============== Utilities =============== */
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "col";

    const innerCard = document.createElement("div");
    innerCard.className = "movie-card card h-100 border-0 shadow-lg";
    innerCard.dataset.imdbId = movie.imdbID; // store the IMDb ID in a data attribute for later retrieval when the card is clicked

    const image = document.createElement("img");
    image.className = "card-img-top";
    image.src = movie.Poster !== "N/A" ? movie.Poster : "/images/posterPlaceholder.png";
    image.alt = `Poster for ${movie.Title}`;
    image.loading = "lazy";
    image.onerror = () => {
        image.onerror = null; // prevent infinite loop if placeholder image also fails to load
        image.src = "/images/posterPlaceholder.png";
    };

    const cardBody = document.createElement("div");
    cardBody.className = "card-body text-center";

    const title = document.createElement("h6");
    title.className = "card-title mb-0";
    title.textContent = movie.Title;

    cardBody.appendChild(title);
    innerCard.appendChild(image);
    innerCard.appendChild(cardBody);
    card.appendChild(innerCard);

    return card;
}

function updateLoadMoreButton() {
    if (!dom.loadMoreButton) return;

    const loadMoreButton = dom.loadMoreButton;

    if (isLoading) {
        loadMoreButton.textContent = "Loading...";
        loadMoreButton.disabled = true;
        return;
    }

    if (currentPage <= totalPages) {
        loadMoreButton.textContent = "Load More";
        loadMoreButton.disabled = false;
        loadMoreButton.classList.remove("d-none");
    }
    else {
        loadMoreButton.classList.add("d-none");
    }
}

function showNotification(message, type = "info", timeout = 4000) {
    if (!dom.userNotification) return;

    const userNotification = dom.userNotification;

    userNotification.textContent = message;
    userNotification.className = `alert alert-${type} text-center`;
    userNotification.classList.remove("d-none");

    if (timeout) {
        clearTimeout(notificationTimer); // clear any existing timeout to prevent multiple notifications from overlapping or disappearing too quickly
        notificationTimer = setTimeout(() => {
            userNotification.classList.add("d-none");
        }, timeout);
    }
}