let jsonData;
let photographers;
let homeMain = document.querySelector('#homepageMain');

// Replace ./data.json with your JSON feed
fetch('/js/data.json')
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    // Work with JSON data here
    jsonData = data;
    photographers = data.photographers;
    console.log(jsonData);
    photographers.forEach((photographer, index) => {
        homeMain.insertAdjacentHTML('beforeend', `
        <article class="photographer">
                <a href="photographer_page.html">
                    <div class="photographer__image">
                        <img src="images/photos/Photographers_ID_Photos/${photographer.portrait}" alt="photo de ${photographer.name}">
                    </div>
                    <h2 class="photographer__name">${photographer.name}</h2>
                </a>
                <p class="photographer__location">${photographer.city}, ${photographer.country}</p>
                <p class="photographer__description">${photographer.tagline}</p>
                <p class="photographer__price">${photographer.price}€/jour</p>
                <ul class="photographer__tags" id="tagGroup_${index}">
                </ul>
            </article>
        `);
        let tagsInCurrentArticle = document.querySelector(`#tagGroup_${index}`);
        photographer.tags.forEach(tag => tagsInCurrentArticle.insertAdjacentHTML('beforeend', `<li class="tag">${tag}</li>`))
    });
  })
  .catch((error) => {
    // Do something for an error here
    console.log(error);
  })