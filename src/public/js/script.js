// state variables
let selectedMovie = null; // stores the currently selected movie's data
let totalPages = 0; // stores the total number of pages available for the current search results
let currentPage = 1; // tracks the current page of search results being displayed
let currentSearch = "";
let isLoading = false; // tracks if a search request is currently in progress

// 
const OMDB_RESULTS_PER_PAGE = 10; // OMDb API returns 10 results per page, used to calculate total pages based on total results
let movieModal = null; // will hold a reference to the movie details modal DOM element for efficient access when opening/closing the modal
let movieModalElements = {}; // will hold references to frequently accessed DOM elements within the movie details modal for efficient updates when rendering movie details


// event listener setup
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("movieSearchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", handleSearchSubmit);
    }

    const cardContainer = document.getElementById("cardContainer");
    if (cardContainer) {
        cardContainer.addEventListener("click", handleCardClick);
    }

    const confirmSaveButton = document.getElementById("confirmSave");
    if (confirmSaveButton) {
        confirmSaveButton.addEventListener("click", handleConfirmSave);
    }

    const loadMoreButton = document.getElementById("loadMore");
    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", handleLoadMore);
    }

    // cache DOM elements 
    const movieDetailsModal = document.getElementById("movieDetailsModal");
    if (movieDetailsModal) {
        movieModal = new bootstrap.Modal(movieDetailsModal);
        movieModalElements = {
            title: document.getElementById("movieTitle"),
            poster: document.getElementById("moviePoster"),
            release: document.getElementById("movieRelease"),
            plot: document.getElementById("moviePlot"),
            rating: document.getElementById("movieRating"),
            id: document.getElementById("movieId")
        };
    }
});

// event handler functions
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
    searchModal();
}

function handleLoadMore() {
    getNextPage();
}

// state management functions
async function startNewSearch() {
    if (isLoading) return; // prevent starting a new search while one is already in progress

    const userSearch = document.getElementById("searchInput").value.trim();
    const feedback = document.getElementById("userFeedback");
    const insertLocation = document.getElementById("cardContainer");

    // checks if a search term wasn't entered. prints an error message to the user and exits the function without calling the server
    if (!userSearch) return;

    // clears the previous search result and feedback message when a new search is performed
    currentPage = 1; // reset to the first page when a new search is performed
    currentSearch = userSearch; // update the current search term
    totalPages = 0; // reset total pages for the new search

    insertLocation.innerHTML = "";
    feedback.textContent = "";
    feedback.classList.remove("text-danger");

    await getNextPage();
}

async function getNextPage() {
    if (isLoading) return; // prevent multiple simultaneous requests
    if (!currentSearch) return; // ensure there's a search term to query with
    if (currentPage > totalPages && totalPages !== 0) return; // prevent requesting pages beyond the total available

    isLoading = true; // set loading state to prevent multiple requests
    updateLoadMoreButton();

    const feedback = document.getElementById("userFeedback");
    
    try {
        const data = await fetchMovieSearchResults(currentSearch, currentPage);

        if (totalPages === 0) {
            totalPages = Math.ceil((data.totalResults || 0) / OMDB_RESULTS_PER_PAGE); // calculate total pages based on total results
        }

        renderMovies(data.results);
        currentPage++;
        
    } catch (error) {
        console.log("Network error:", error);
        feedback.textContent = "Unable to connect. Please check your network connection and try again.";
        feedback.classList.add("text-danger");
    }

    isLoading = false; // reset loading state after request completes
    updateLoadMoreButton();
}

async function openMovieDetailsModal(imdbId) {
    try {
        const movieDetails = await fetchMovieDetails(imdbId);
        selectedMovie = movieDetails; // store the selected movie's data in the global variable

        renderMovieDetails(movieDetails);
    }
    catch (error) {
        console.log("Error fetching movie details:", error);
    }
}

// fetch functions
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

// rendering functions
function renderMovies(movies) {
    const insertLocation = document.getElementById("cardContainer");
    for (const movie of movies) {
        insertLocation.append(createMovieCard(movie));
    }
}

function renderMovieDetails(movie) {
    if (!movieModal) return; // ensure the modal has been cached before trying to render details

    movieModalElements.id.textContent = `IMDb ID: ${movie.imdbID}`;
    movieModalElements.title.textContent = movie.Title;

    movieModalElements.poster.src = movie.Poster !== "N/A" ? movie.Poster : "/images/posterPlaceholder.png";
    movieModalElements.poster.alt = `Poster for ${movie.Title}`;
    movieModalElements.poster.loading = "lazy";
    movieModalElements.poster.onerror = () => {
        movieModalElements.poster.onerror = null; // prevent infinite loop if placeholder image also fails to load
        movieModalElements.poster.src = "/images/posterPlaceholder.png"; 
    };
    
    movieModalElements.release.textContent = `Release Date: ${movie.Released}`;
    movieModalElements.plot.textContent = movie.Plot;
    movieModalElements.rating.textContent = `IMDb Rating: ${movie.imdbRating}`;

    movieModal.show();
}

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
        image.src = "/images/posterPlaceholder.png"; // update - to a placeholder image if desired
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
    const loadMoreButton = document.getElementById("loadMore");

    if (!loadMoreButton) return;

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

async function searchModal()
{
    try {
        // replacing single quotes with TWO single quotes so that the postgreSQL query doesn't throw a fit
        var singleQuote = /'/gm;
        if(title.match(singleQuote)) { title = title.replaceAll("'", "''");}
        if(plot.match(singleQuote)) { plot = plot.replaceAll("'", "''"); }

        const response = await fetch(`/movies/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                poster: image,
                title: title,
                release: release,
                rating: rating,
                plot: plot
            })
        });

        // const data = await response.json();

        document.getElementById("userFeedback").textContent = feedbackMessage;
    } catch (error) {
        console.log("Error fetching movie data:", error);
    }
}