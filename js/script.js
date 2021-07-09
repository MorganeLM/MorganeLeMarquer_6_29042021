let jsonData;
let photographers;
let tagNav = document.querySelector('#tagNav');
let homeMain = document.querySelector('#homepageMain');
let tagFilter;
let tagList = [];
//let tagObjects = [];

// class menuTag {
//     constructor(name, state){
//       this.name = name;
//       this.state = state;
//     }
  
//     // function setTagEvent() ?
//     // get area() {
//     //   return this.calcArea();
//     // }
// }

async function getData() {
    let response = await fetch('/js/data.json');
    let data = await response.json();
    let photographers = data.photographers;
    if(tagFilter){
        console.log(photographers);
        photographers = photographers.filter((element) => {
            if(element.tags.indexOf(tagFilter) !== -1){
                return element;
            }
        });
        console.log(photographers);
    }
    return photographers;
}

function getTagList(){ 
    return getData().then((photographers) => {
        photographers.forEach(function(photographer){
            photographer.tags.forEach((tag) => {
                if(tagList.indexOf(tag) === -1){
                    tagList.push(tag);
                }
            });
        });
    });
}

function addTags(){
    return getTagList().then(function(){
        tagList.forEach((tag) => {
            tagNav.insertAdjacentHTML('beforeend', `<li class="tag navTag">${tag}</li>`);
        });
        addTagEvents('#tagNav > li');
    });
}

function createTemplate(photographers){
    // génère les cartes des photographes
    homeMain.innerHTML = '';
    photographers.forEach((photographer, index) => {
        homeMain.insertAdjacentHTML('beforeend', `
        <article class="photographer">
                <a href="photographer_page.html?id=${photographer.id}">
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
        // Cahier des charges : event sur tag du menu
        //addTagEvents(`#tagGroup_${index} > li`);
    });
}

function addTagEvents(tagElt){
    let tags = document.querySelectorAll(tagElt);
    tags.forEach((tag) => tag.addEventListener('click', function(e){
        e.preventDefault();
        tagFilter = this.innerHTML;
        this.classList.add('activeTag');
        tags.forEach((tag) => {
            if(tagFilter !== tag.innerHTML){
                tag.classList.remove('activeTag');
            }
        });
        console.log(tagFilter);
        getData().then((photographers) => createTemplate(photographers));
    }));
}

// function addTagClass(){
//     let allTags = document.querySelectorAll('.tag');
//     return allTags.forEach((tag) => tag.addEventListener('click', function(){
//         if(tag.innerHTML === tagFilter){
//             this.classList.add('activeTag');
//         }else{
//             this.classList.remove('activeTag');
//         }
//     }))
// }

getData()
    .then((photographers) => createTemplate(photographers))
    .then(() => addTags())
    // .then(() => addTagClass())



// ------------------------------------------------------------
// ----------------------PHOTOGRAPHER PAGE---------------------
// ------------------------------------------------------------
// separate JS


