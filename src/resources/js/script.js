function getMovieData()
{
    // "userSearch" is pulled from the text entered into the search box on the navbar
    const userSearch = document.getElementById("search_input").value;
    // checks if a search term wasn't entered. prints an error message and exits the function if true 
    if (userSearch == "")
    {
        console.log("No search term was entered.");
        return;
    }

    // creates the url that will be used to call the OMDb API
    const apiKey = "42b47cce";
    var url = `http://www.omdbapi.com/?apikey=${apiKey}&`;
    // IMDB ID's follow the format of "tt" followed by at least 7 digits https://developer.imdb.com/documentation/key-concepts
    var imdbIDRegex = /[t]{2}\d{7,}/;
    // enters if "userSearch" was an IMDB id. appends "userSearch" to "url" with the ID format
    if (userSearch.match(imdbIDRegex))
    {
        url += `i=${userSearch}`;
    }
    // else "userSearch" wasn't an IMDB id, so it's a title. appends "userSearch" to "url" with the Title format
    else
    {
        url += `t=${userSearch}`;
    }

    // performs an AJAX call to the OMDb API with "url"
    $.ajax({
        url:url,
        dataType:"json"
    }).then(data =>
        {
            console.log(data);
            const insertLocation = document.getElementById("card_container");
            insertLocation.innerHTML = "";
            // appends an error message to the page and exits the function if the API call was unsuccessful
            if (data.Response == "False")
            {
                insertLocation.innerHTML = `<p class='text-center' style='color: red; font-size: xx-large; font-weight: bolder;'>${data.Error}</p>`
                return;
            }
            // else appends a card containing the movie's data to the page
            else
            {
                var movieCard = createMovieCard(data.Poster, data.Title, data.Released, data.imdbRating, data.Plot);
                insertLocation.append(movieCard);
            }
        });
    return;
};

function createMovieCard(image, title, release, rating, plot)
{
    // checks if any of the passed in values were undefined and sets them to "-" if they were
    if (!image || image == "N/A") { image = "-"; }
    if (!title || title == "N/A") { title = "-"; }
    if (!release || release == "N/A") { release = "-"; }
    if (!rating || rating == "N/A") { rating = "-"; }
    if (!plot || plot == "N/A") { plot = "-"; }
    
    // creating HTML elements that will be combined to create a card
    var completeCard = document.createElement("div");
    var cardBody = document.createElement("div");
    var movieImage = document.createElement("img");
    var movieTitle = document.createElement("p");
    var movieRelease = document.createElement("p");
    var imdbRating = document.createElement("p");
    var moviePlot = document.createElement("p");
    var cardButton = document.createElement("button");

    // styling the various elements
    completeCard.className = "card bg-light shadow p-3 mb-5 rounded";
    cardBody.className = "card-body";

    movieImage.className = "card-img-top";
    movieImage.src = image;
    movieImage.alt = `Poster for ${title}`;
    movieImage.style = "height: 400px; object-fit: scale-down;";
    movieImage.id = "movieImage";

    movieTitle.className = "card-text text-center";
    movieTitle.style = "font-weight: bolder; font-size: xx-large;";
    movieTitle.innerHTML = title;
    movieTitle.id = "movieTitle";
    movieTitle.name = title;

    movieRelease.className = "card-text";
    movieRelease.style = "font-weight: bold;";
    movieRelease.innerHTML = `Release Date: ${release}`;
    movieRelease.id = "movieRelease";
    movieRelease.name = release;

    imdbRating.className = "card-text";
    imdbRating.style = "font-weight: bold;";
    imdbRating.innerHTML = `IMDB Rating: ${rating} <hr>`;
    imdbRating.id = "movieRating";
    imdbRating.name = rating;

    moviePlot.className = "card-text";
    moviePlot.innerHTML = plot;
    moviePlot.id = "moviePlot";
    moviePlot.name = plot;

    cardButton.type = "button"
    cardButton.className = "btn btn-primary mr-auto ml-auto";
    cardButton.setAttribute("data-toggle", "modal");
    cardButton.setAttribute("data-target", "#myModal");
    cardButton.style = "background-color: forestgreen; width: 50%; min-width: fit-content; border-radius: 1rem;";
    cardButton.innerHTML = "Add Search Result";

    // appending the elements together to create the card
    cardBody.append(movieTitle);
    cardBody.append(movieRelease);
    cardBody.append(imdbRating);
    cardBody.append(moviePlot);

    completeCard.append(movieImage);
    completeCard.append(cardBody);
    completeCard.append(cardButton);

    return completeCard;
};

function searchModal()
{
    // gathering the variables from the previous AJAX call
    var image = document.getElementById("movieImage").src;
    var title = document.getElementById("movieTitle").name;
    var release = document.getElementById("movieRelease").name;
    var rating = document.getElementById("movieRating").name;
    var plot = document.getElementById("moviePlot").name;
    var successMessage = `<p class="text-center" style="color: forestgreen; font-weight: bold; font-size: xx-large;"> Successfully added ${title} to your search history! </p>`;
    // replacing single quotes with TWO single quotes so that the postgreSQL query doesn't throw a fit
    var singleQuote = /'/gm;
    if(title.match(singleQuote)) { title = title.replace("'", "''");}
    if(plot.match(singleQuote)) { plot = plot.replace("'", "''"); }

    // performing an AJAX call to pass the data to the "/add" API
    $.ajax({
        url:"/add",
        type:"POST",
        dataType:"json",
        data:
        {
            poster: image,
            title: title,
            release: release,
            rating: rating,
            plot: plot
        },
        success: $('#card_container').prepend(successMessage)
    });
}