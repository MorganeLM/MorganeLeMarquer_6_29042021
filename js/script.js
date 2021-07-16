/*jslint es6 */
'use strict';

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
const getData = async () => {
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
    if(tagNav){
        return getTagList().then(function(){
            tagList.forEach((tag) => {
                tagNav.insertAdjacentHTML('beforeend', `<li class="tag navTag">${tag}</li>`);
            });
            addTagEvents('#tagNav > li');
        });
    }
}

function createTemplate(photographers){
    // génère les cartes des photographes
    if(homeMain){
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
// separate JS ?
const photographerPage = document.querySelector('.photographer_page');
let selectedPhotographer;
// factory for media
function Image(media){
    this.id = media.id
    this.photographerId = media.photographerId
    this.title = media.title
    this.image = media.image
    this.tags = media.tags
    this.likes = media.likes
    this.date = media.date
    this.price = media.price
    this.description = `Photo nommée ${media.title} prise le ${media.date}`
}

function Video(media){
    this.id = media.id
    this.photographerId = media.photographerId
    this.title = media.title
    this.video = media.video
    this.tags = media.tags
    this.likes = media.likes
    this.date = media.date
    this.price = media.price
    this.description = `Vidéo nommée ${media.title} tournée le ${media.date}`
}

function MediaFactory(media, type){
    // this.create = function(media, type){
        switch(type){
            case 'image':
                return new Image(media);
            case 'video':
                return new Video(media);
        }
    // }
}

function addLike(){
    this.like ++;
}

async function showData() {

    // read our JSON
    let response = await fetch('/js/data.json');
    let data = await response.json();
    let photographers = data.photographers;
    let medias = data.media;
    let photographerMedias = [];

    // search photographer
    const currentPhotographerId = new URL(window.location.href).searchParams.get('id');
    let photographerId = parseInt(currentPhotographerId);
    // let photographer = photographers.find((element) => element.id === photographerId);
    // console.log(photographers[0].id);
    photographers.forEach(element => {
        if(element.id === photographerId){
            selectedPhotographer = element;
            return selectedPhotographer;
        }
    });
    console.log(selectedPhotographer);
    let selectedPhotographerName = selectedPhotographer.name.split(' ')[0];

    // search medias of the photographer
    medias.forEach(media => {
        if(media.photographerId === photographerId){
            photographerMedias.push(media);
        }
    })
    console.log(photographerMedias);
    let videosAndImages = [];
    photographerMedias.forEach(media => {
        if(media.image){
            videosAndImages.push(MediaFactory(media, 'image'));
        }
        if(media.video){
            videosAndImages.push(MediaFactory(media, 'video'));
        }
    })
    console.log(videosAndImages);

    // Ajout du template - section description du photographe
    photographerPage.insertAdjacentHTML('beforeend',
        `<section class="photographer_info">
        <div class="photographer_info__bloc">
            <h2 class="photographer__name">${selectedPhotographer.name}</h2>
            <p class="photographer__location">${selectedPhotographer.city}, ${selectedPhotographer.country}</p>
            <p class="photographer__description">${selectedPhotographer.tagline}</p>
            <p class="photographer__price">${selectedPhotographer.price}€/jour</p>
            <ul class="photographer__tags" id="tagGroup">
            </ul>
        </div>
        <div class="photographer_info__bloc">
            <button id="contact">
                Contactez-moi
            </button>
        </div>
        <div class="photographer__image">
            <img src="images/photos/Photographers_ID_Photos/${selectedPhotographer.portrait}" alt="photo de ${selectedPhotographer.name}">
        </div>
    </section>`
    );

    // Ajout du template - section media - filtre
    photographerPage.insertAdjacentHTML('beforeend',
    `<section class="photoSection">
        <div class="photoSection__filter">
            Trier par 
            <select>
                <option>Popularité <i class="las la-angle-down"></i></option>
                <option>Date</option>
                <option>Titre</option>
            </select>
        </div>
        <div class="photoSection__list">
        </div>
    </section>`)

    // Ajout du template - section media - media
    let photographerPageMediaList = document.querySelector('.photoSection__list');
    videosAndImages.forEach(media => {
        if(media.image){
            photographerPageMediaList.insertAdjacentHTML('beforeend',
            `<article class="photoSection__list__photoBloc">
                <figure>
                    <div class="photoSection__list__photoBloc__photo">
                        <img src="images/photos/${selectedPhotographerName}/${media.image}" alt="${media.description}">
                    </div>
                    <figcaption>
                        <h3>${media.title}</h3>
                        <div>
                            <span>${media.likes}</span>
                            <i class="las la-heart"></i>
                        </div>
                    </figcaption>
                </figure>
            </article>`);
        }
        if(media.video){
            photographerPageMediaList.insertAdjacentHTML('beforeend',
            `<article class="photoSection__list__photoBloc">
                <figure>
                    <div class="photoSection__list__photoBloc__photo">
                        <video width='100%' height='100%' controls>
                            <source src="images/photos/${selectedPhotographerName}/${media.video}" type="video/mp4" alt="${media.description}">
                            Erreur de chargement de la video.
                        </video>
                    </div>
                    <figcaption>
                        <h3>${media.title}</h3>
                        <div>
                            <span>${media.likes}</span>
                            <i class="las la-heart"></i>
                        </div>
                    </figcaption>
                </figure>
            </article>`)
        }
    })
}

if(photographerPage){
    showData().then(() => {
        let tagsInCurrentPhotographer = document.querySelector(`#tagGroup`);
        selectedPhotographer.tags.forEach(tag => tagsInCurrentPhotographer.insertAdjacentHTML('beforeend', `<li class="tag">${tag}</li>`));
    })
}

