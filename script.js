const originalData = []; // Stała tablica z oryginalnymi danymi
let filteredData = []; // Tablica z przefiltrowanymi danymi

// Funkcja wywołująca się po załadowaniu strony
document.addEventListener("DOMContentLoaded", function () {
    // Pobranie danych z pliku JSON
    fetch("data/database.json")
        .then(response => response.json())
        .then(responseData => {
            originalData.push(...responseData); // Dodanie oryginalnych danych do stałej tablicy
            filteredData = [...originalData]; // Inicjalizacja przefiltrowanej tablicy
            generatePosts(filteredData); // Wygenerowanie postów na podstawie kopii oryginalnych danych
            populateYearSelect();
        })
        .catch(error => console.error("Błąd podczas pobierania danych:", error));

    const filterButton = document.querySelector(".filter-panel__button");
    filterButton.addEventListener("click", applyFilters);
});

// Funkcja aplikująca filtry na posty
function applyFilters() {
    const selectedYear = document.getElementById("year").value;
    const sportCheckbox = document.getElementById("sport");
    const superCheckbox = document.getElementById("super");
    const muscleCheckbox = document.getElementById("muscle");

    const selectedTypes = [];
    // Sprawdzenie, które checkboxy są zaznaczone i dodanie do tablicy zaznaczonych typów
    if (sportCheckbox.checked) selectedTypes.push(sportCheckbox.value);
    if (superCheckbox.checked) selectedTypes.push(superCheckbox.value);
    if (muscleCheckbox.checked) selectedTypes.push(muscleCheckbox.value);

    // Zastosowanie filtrowania na danych
    filteredData = filterPosts(selectedYear, selectedTypes, [...originalData]); // Utworzenie kopii oryginalnych danych
    // Aktualizacja wyświetlanych postów po zastosowaniu filtrów
    updateFilteredPosts(filteredData);
}

// Funkcja wypełniająca selecta z zakresem lat
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

    option.value = "all";
    option.innerHTML = "Wszystkie lata";
    yearSelect.appendChild(option);
}

// Funkcja filtrująca posty
function filterPosts(selectedYear, selectedTypes, data) {
    const filteredPosts = data.filter(post => {
        const postYear = parseInt(post.year);
        const yearRange = selectedYear.split("-").map(Number);
        const isYearMatch = selectedYear === "all" || (postYear >= yearRange[0] && postYear <= yearRange[1]);

        const isTypeMatch = selectedTypes.length === 0 || selectedTypes.includes(post.type);

        return isYearMatch && isTypeMatch;
    });

    return filteredPosts;
}

// Funkcja aktualizująca wyświetlane posty
function updateFilteredPosts(filteredPosts) {
    const postsContainer = document.getElementById("posts-container");

    // Usunięcie wszystkich postów z kontenera
    postsContainer.innerHTML = "";

    // Ponowne wywołanie funkcji do generowania postów dla przefiltrowanych danych
    generatePosts(filteredPosts);
}

// Funkcja generująca posty
function generatePosts(data) {
    const postsContainer = document.getElementById("posts-container");

    // Sprawdzenie, czy kontener na posty istnieje
    if (!postsContainer) {
        console.error("Błąd: Kontener na posty nie został znaleziony");
        return;
    }

    // Wygenerowanie postów na podstawie danych
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

        // Dodanie tła
        article.style.backgroundImage = `url(${car.img})`;

        // Dodanie karty do kontenera
        postsContainer.appendChild(article);

        // Dodanie listenera dla otwierania okna popup
        article.addEventListener("click", function () {
            openPopupWindow(index, filteredData);
        });
    });
}

// Funkcja generująca przycisk zamykania popupa
function generateCloseButton() {
    const popupContent = document.getElementById("popup-content");

    const closeButton = document.createElement("span");
    closeButton.id = "close-popup";
    closeButton.innerHTML = "X";
    closeButton.addEventListener("click", closePopupWindow);

    popupContent.appendChild(closeButton);
}

// Funkcja otwierająca popup
function openPopupWindow(index, data) {
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
        <ul class="data-list">
        <li><b>Rok produkcji: </b><span>${carData.year}</span></li>
        <li><b>Typ: </b><span>${carData.type}</span></li>
        <li><b>Silnik: </b><span>${carData.engine}</span></li>
        <li><b>Moc silnika: </b><span>${carData.horsePower}</span></li>
        <li><b>0-100km/h: </b><span>${carData.to100}</span></li>
        <li><b>Predkosc maksymalna: </b><span>${carData.vMax}</span></li>
        </ul>
    `;

    popupUppperContainer.appendChild(popupImage);
    popupUppperContainer.appendChild(popupInfo);

    const popupDescription = document.createElement("p");
    popupDescription.classList.add("popup-content__description");
    popupDescription.innerHTML = carData.description;

    popupContent.innerHTML = "";
    popupContent.appendChild(popupTitle);
    generateCloseButton();  // Generowanie przycisku zamykania
    popupContent.appendChild(popupUppperContainer);
    popupContent.appendChild(popupDescription);

    overlay.style.display = "block";
    popup.style.display = "block";
}

// Funkcja zamykająca popup
function closePopupWindow() {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");

    overlay.style.display = "none";
    popup.style.display = "none";
}

// Funkcja do skracania tekstu
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
}