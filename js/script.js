let jsonData;
let photographers;
let homeMain = document.querySelector('#homepageMain');
let tagFilter;

// fetch('/js/data.json')
//   .then((response) => response.json())
//   .then((data) => {
//     // récupère les photographes
//     jsonData = data;
//     photographers = data.photographers;
//     if(tagFilter){
//         photographers = photographers.filter((element) => {
//            if(element.tags.indexOf(tagFilter) !== -1){
//                return element;
//            }
//         });
//     }
//     // génère les cartes des photographes
//     photographers.forEach((photographer, index) => {
//         homeMain.insertAdjacentHTML('beforeend', `
//         <article class="photographer">
//                 <a href="photographer_page.html">
//                     <div class="photographer__image">
//                         <img src="images/photos/Photographers_ID_Photos/${photographer.portrait}" alt="photo de ${photographer.name}">
//                     </div>
//                     <h2 class="photographer__name">${photographer.name}</h2>
//                 </a>
//                 <p class="photographer__location">${photographer.city}, ${photographer.country}</p>
//                 <p class="photographer__description">${photographer.tagline}</p>
//                 <p class="photographer__price">${photographer.price}€/jour</p>
//                 <ul class="photographer__tags" id="tagGroup_${index}">
//                 </ul>
//             </article>
//         `);
//         // Je cherche l'élement groupe de tag et le rempli des tags
//         let tagsInCurrentArticle = document.querySelector(`#tagGroup_${index}`);
//         photographer.tags.forEach(tag => tagsInCurrentArticle.insertAdjacentHTML('beforeend', `<li class="tag">${tag}</li>`));
//         // J'ajoute un écouteur d'évenement sur chaque tag et récupère le filtre
//         let tags = document.querySelectorAll(`#tagGroup_${index} > li`);
//         tags.forEach((tag) => tag.addEventListener('click', function(){
//             tagFilter = this.textContent;
//         }))
//     });
//   })
//   .catch((error) => {
//     console.log(error);
//   })

// function loadPhotographers(data){
//     photographers = data.photographers;
//     if(tagFilter){
//         photographers = photographers.filter((element) => {
//            if(element.tags.indexOf(tagFilter) !== -1){
//                return element;
//            };
//         });
//     }
// }

async function getData() {
    let response = await fetch('/js/data.json');
    let data = await response.json();
    let photographers = data.photographers;
    if(tagFilter){
        photographers = photographers.filter((element) => {
            if(element.tags.indexOf(tagFilter) !== -1){
                return element;
            };
        });
    }
    return photographers;
}

photographers = getData().then((photographers)=>{
    createTemplate(photographers);
})

function createTemplate(photographers){
    // génère les cartes des photographes
    homeMain.innerHTML = '';
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
        // Je cherche l'élement groupe de tag et le rempli des tags
        let tagsInCurrentArticle = document.querySelector(`#tagGroup_${index}`);
        photographer.tags.forEach(tag => tagsInCurrentArticle.insertAdjacentHTML('beforeend', `<li class="tag">${tag}</li>`));
        // J'ajoute un écouteur d'évenement sur chaque tag et récupère le filtre
        addTagEvents(`#tagGroup_${index} > li`);
    });
}

function addTagEvents(tagElt){
    let tags = document.querySelectorAll(tagElt);
    tags.forEach((tag) => tag.addEventListener('click', function(){
        tagFilter = this.textContent;
        photographers = getData().then((photographers)=>{
            createTemplate(photographers);
        })
    }))
}