let data;


//pobieranie danych generowanie postow - wywołanie funkcji po załadowaniu strony
document.addEventListener("DOMContentLoaded", function () {
    // Pobierz dane z pliku JSON po załadowaniu strony
    fetch("data/database.json")
        .then(response => response.json())
        .then(responseData => {
            data = responseData;
            generatePosts(data); // Wywołaj funkcję do generowania postów
            populateYearSelect(); // Wywołaj funkcję do wypełniania selecta z zakresami lat
        })
        .catch(error => console.error("Error fetching data:", error));

    // Obsługa filtrowania - dodaj event listener do przycisku
    const filterButton = document.querySelector(".filter-panel__button");
    filterButton.addEventListener("click", applyFilters);
});


//filtrowanie postów - pobiera wartości z inputów i checkboxów i przekazuje je do funkcji filterPosts
function applyFilters() {
    const selectedYear = document.getElementById("year").value;
    const sportCheckbox = document.getElementById("sport");
    const superCheckbox = document.getElementById("super");
    const muscleCheckbox = document.getElementById("muscle");

    const selectedTypes = [];
    // Sprawdź czy checkboxy są zaznaczone i dodaj do tablicy zaznaczone typy
    if (sportCheckbox.checked) selectedTypes.push(sportCheckbox.value);
    if (superCheckbox.checked) selectedTypes.push(superCheckbox.value);
    if (muscleCheckbox.checked) selectedTypes.push(muscleCheckbox.value);

    // Zastosuj filtrowanie na danych
    const filteredPosts = filterPosts(selectedYear, selectedTypes, data);

    // Po zastosowaniu filtrowania, zaktualizuj generowane posty na stronie
    updateFilteredPosts(filteredPosts);
}

//wypełnianie selecta z zakresami lat
function populateYearSelect() {
    const yearSelect = document.getElementById("year");
    let option = document.createElement("option");

    option.value = "1945-1949";
    option.innerHTML = "1945 - 1950";
    yearSelect.appendChild(option);

    // Zakres lat od 1945 do 2000
    for (let startYear = 1951; startYear < 2000; startYear += 10) {
        const endYear = startYear + 9;
        let option = document.createElement("option");
        option.value = `${startYear}-${endYear}`;
        option.innerHTML = `${startYear} - ${endYear}`;
        yearSelect.appendChild(option);
    }
}

//filtrowanie postów - przyjmuje zakres lat, tablicę z typami i tablicę z danymi
function filterPosts(selectedYear, selectedTypes, data) {
    const filteredPosts = data.filter(post => {
        const postYear = parseInt(post.year);
        const yearRange = selectedYear.split("-").map(Number);
        const isYearInRange = postYear >= yearRange[0] && postYear <= yearRange[1];

        const isTypeMatch = selectedTypes.length === 0 || selectedTypes.includes(post.type);

        return isYearInRange && isTypeMatch;
    });

    return filteredPosts;
}


//aktualizacja postów - przyjmuje tablicę z danymi
function updateFilteredPosts(filteredPosts) {
    const postsContainer = document.getElementById("posts-container");

    // Usuń wszystkie posty z kontenera
    postsContainer.innerHTML = "";

    // Ponownie wywołaj funkcję do generowania postów dla przefiltrowanych danych
    generatePosts(filteredPosts);
}

//generowanie postów - przyjmuje tablicę z danymi
function generatePosts(data) {
    const postsContainer = document.getElementById("posts-container");

    // Sprawdź czy kontener na posty istnieje
    if (!postsContainer) {
        console.error("Error: Posts container not found");
        return;
    }

    // Wygeneruj posty na podstawie danych - dla każdego obiektu w tablicy data
    data.forEach((car, index) => {
        const article = document.createElement('article');
        article.classList.add('card');
        article.setAttribute("data-index", index);

        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const h2 = document.createElement('h2');
        h2.classList.add('card-title');
        h2.innerHTML = car.name;

        cardContent.appendChild(h2);

        const cardHover = document.createElement('div');
        cardHover.classList.add('card-hover');

        const hoverDescription = document.createElement('p');
        hoverDescription.classList.add('card-description');
        let description = truncateText(car.description, 150);
        hoverDescription.innerHTML = description;

        cardHover.appendChild(hoverDescription);

        article.appendChild(cardContent);
        article.appendChild(cardHover);

        // Set the background image for the card
        article.style.backgroundImage = `url(${car.img})`;

        // Add the card to the posts container
        postsContainer.appendChild(article);

        // Dodaj event listener dla otwierania okna popup
        article.addEventListener("click", function () {
            openPopupWindow(index);
        });
    });
}

//generowanie przycisku zamykania popupa - zapobiega nadpisywaniu go podczas generowania popupa
function generateCloseButton() {
    const popupContent = document.getElementById("popup-content");

    const closeButton = document.createElement("span");
    closeButton.id = "close-popup";
    closeButton.innerHTML = "X";
    closeButton.addEventListener("click", closePopupWindow);

    popupContent.appendChild(closeButton);
}

//otwieranie popupa - przyjmuje index z tablicy data i na jego podstawie generuje popup
function openPopupWindow(index) {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popup-content");

    const carData = data[index];

    const popupTitle = document.createElement("h2");
    popupTitle.classList.add("popup-content__title");
    popupTitle.innerText = carData.name;

    const popupUppperContainer = document.createElement("div");
    popupUppperContainer.classList.add("popup-content__upper-container");

    const popupImage = document.createElement("img");
    popupImage.classList.add("popup-content__image");
    popupImage.src = carData.img;

    const popupInfo = document.createElement("div");
    popupInfo.innerHTML = `
        <p><b>Rok produkcji:</b> ${carData.year}</p>
        <p><b>Typ:</b> ${carData.type}</p>
        <p><b>Silnik:</b> ${carData.engine}</p>
        <p><b>Moc silnika:</b> ${carData.horsePower}</p>
        <p><b>0-100km/h:</b> ${carData.to100}</p>
        <p><b>Predkosc maksymalna:</b> ${carData.vMax}</p>
    `;

    popupUppperContainer.appendChild(popupImage);
    popupUppperContainer.appendChild(popupInfo);

    const popupDescription = document.createElement("p");
    popupDescription.classList.add("popup-content__description");
    popupDescription.innerHTML = carData.description;


    popupContent.innerHTML = "";
    popupContent.appendChild(popupTitle);
    generateCloseButton();  //generowanie przycisku zamykania
    popupContent.appendChild(popupUppperContainer);
    popupContent.appendChild(popupDescription);

    overlay.style.display = "block";
    popup.style.display = "block";
}


//zamykanie popupa
function closePopupWindow() {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");

    overlay.style.display = "none";
    popup.style.display = "none";
}

// Funkcja do skracania tekstu niezbędna do poprawnego działania .card-hover
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
}
