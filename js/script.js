/*jslint es6 */
'use strict';

let jsonData;
let photographers;
let tagNav = document.querySelector('#tagNav');
let homeMain = document.querySelector('#homepageMain');
let tagFilter = null;
let tagList = [];

// Touches entrée ou espace = clic sur liens au rôle bouton
function enterEqualCLick(){
    document.querySelectorAll('[role="button"]').forEach(function(button){
        button.addEventListener('keydown', function(evt){
           if(evt.keyCode == 13 || evt.keyCode == 32) {
               button.click();
           }
        });
    });
}

const getData = async () => {
    let response = await fetch('js/data.json');
    let data = await response.json();
    let photographers = data.photographers;
    // liste des tags présents dans les données de photographes
    photographers.forEach((photographer) => {
        photographer.tags.forEach((tag) => {
            if(tagList.indexOf(tag) === -1){
                tagList.push(tag);
            }
        });
    });
    // filtre des données si tag actif
    if(tagFilter){
        if(tagFilter !== "all"){
            photographers = photographers.filter((element) => {
                if(element.tags.indexOf(tagFilter) !== -1){
                    return element;
                }
            });
        }
    }
    else{
        // filtre des données si tag venant de l'url
        let tagFromPhotographerPage = new URL(window.location.href).searchParams.get('tag');
        if(tagFromPhotographerPage){
            tagFilter = tagFromPhotographerPage;
            photographers = photographers.filter((element) => {
                if(element.tags.indexOf(tagFromPhotographerPage) !== -1){
                    return element;
                }
            });
        }
    }
    return photographers;
}

const addTags = () => {
    if(tagNav){
        tagList.forEach((tag) => {
            tagNav.insertAdjacentHTML('beforeend', `<span class="sr-only">tag</span> <a class="tag navTag" role="button" href="">${tag}</a>`);
        });
    }
}

const createTemplate = (photographers) => {
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
                    <div class="photographer__tags" id="tagGroup_${index}">
                    </div>
                </article>
            `);
            // Je cherche l'élement groupe de tag et le rempli des tags
            let tagsInCurrentArticle = document.querySelector(`#tagGroup_${index}`);
            photographer.tags.forEach(tag => tagsInCurrentArticle.insertAdjacentHTML('beforeend', `<span class="sr-only">tag #</span> <a class="tag articleTag" role="button" href="">${tag}</a>`));
        });
    }
}

function addTagEvents(tagElt){
    let tags = document.querySelectorAll(tagElt);
    tags.forEach((tag) => tag.addEventListener('click', function(e){
        e.preventDefault();
        // gestion du tag cliqué
        if(tagFilter === this.innerHTML){
            this.classList.remove('activeTag');
            tagFilter = "all";
        }else{
            this.classList.add('activeTag');
            tagFilter = this.innerHTML;
        }
        // gestion des autres tags
        if(tagElt !== 'a.tag'){
            let allTags = document.querySelectorAll('a.tag');
            allTags.forEach((tag) => {
                if(tagFilter === tag.innerHTML){
                    tag.classList.add('activeTag');
                }else{
                    tag.classList.remove('activeTag');
                }
            });
        }else{
            tags.forEach((tag) => {
                if(tagFilter === tag.innerHTML){
                    tag.classList.add('activeTag');
                }else{
                    tag.classList.remove('activeTag');
                }
            });
        }
        enterEqualCLick();
        // génération du template avec filtre actualisé
        getData()
            .then((photographers) => createTemplate(photographers))
            .then(() => addTagEvents('a.articleTag'))
    }));
}


getData()
    .then((photographers) => createTemplate(photographers))
    .then(() => addTags())
    .then(() => addTagEvents('a.tag'))
    .then(() => {
        let tags = document.querySelectorAll('.navTag');
            tags.forEach((tag) => {
                if(tagFilter === tag.innerHTML){
                    tag.classList.add('activeTag');
                }
            });
    })



// ------------------------------------------------------------
// ----------------------PHOTOGRAPHER PAGE---------------------
// ------------------------------------------------------------
const photographerPage = document.querySelector('.photographer_page');
let selectedPhotographer;
let selectedPhotographerName;
let sortValue = "";
let videosAndImages = [];
let errorMessages = [];
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
    this.path = `images/photos/${selectedPhotographerName}/${media.image}`
    this.element = `<img src="${this.path}" alt="${this.description}">`
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
    this.description = `Vidéo nommée ${this.title} tournée le ${this.date}`
    this.path = `images/photos/${selectedPhotographerName}/${this.video}`
    this.element = `<video height="100%"  width="100%">
                        <source src="${this.path}" type="video/mp4" alt="${this.description}">
                        Erreur de chargement de la video.
                    </video>`
}

function MediaFactory(media, type){
    // this.create = function(media, type){
        switch(type){
            case 'image':
                return new Image(media);
            case 'video':
                return new Video(media);
        }
    //}
}

const addLike = (media) => media.likes ++;

async function getMediaData() {
    // read JSON file
    let response = await fetch('js/data.json');
    let data = await response.json();
    let photographers = data.photographers;
    let medias = data.media;
    let photographerMedias = [];
    // search photographer
    const currentPhotographerId = new URL(window.location.href).searchParams.get('id');
    let photographerId = parseInt(currentPhotographerId);
    selectedPhotographer = photographers.find((element) => element.id === photographerId);
    selectedPhotographerName = selectedPhotographer.name.split(' ')[0]; // for media path
    // search medias of the selected photographer
    medias.forEach(media => {
        if(media.photographerId === photographerId){
            photographerMedias.push(media);
        }
    })
    // use MediaFactory to add properties to media objects (description for alt="")
    photographerMedias.forEach(media => {
        if(media.image){
            videosAndImages.push(MediaFactory(media, 'image'));
        }
        if(media.video){
            videosAndImages.push(MediaFactory(media, 'video'));
        }
    })
}

const showData = () => {
    // Réinitialisation du template (pour la fonction de tri)
    photographerPage.innerHTML = '';
    //Ajout du skipcontent
    photographerPage.insertAdjacentHTML('beforeend',`<a href="#photoContent" class="skipContent" role="button">
    Passer au contenu</a>`);
    // Ajout du template - section description du photographe
    photographerPage.insertAdjacentHTML('beforeend',
        `<section class="photographer_info">
            <div class="photographer_info__bloc">
                <h2 class="photographer__name">${selectedPhotographer.name}</h2>
                <p class="photographer__location">${selectedPhotographer.city}, ${selectedPhotographer.country}</p>
                <p class="photographer__description">${selectedPhotographer.tagline}</p>
                <div class="photographer__tags" id="tagGroup">
                </div>
            </div>
            <div class="photographer_info__contactBloc">
                <button id="contact" title="Contactez-moi">
                    Contactez-moi
                </button>
            </div>
            <div class="photographer__image">
                <img src="images/photos/Photographers_ID_Photos/${selectedPhotographer.portrait}" alt="photo de ${selectedPhotographer.name}">
            </div>
        </section>`
    );
    // Ajout de la modal de contact
    photographerPage.insertAdjacentHTML('beforeend',
        `<div id="contact_modal">
            <h1>
                Contactez-moi <br>
                ${selectedPhotographer.name}
                <a href="" role="button" id="close_contact" aria-label="fermer la modal">
                    <i class="las la-times"></i>
                </a>
            </h1>
            <form method="post">
                <label for="firstname">
                    Prénom
                    <input type="firstname" id="firstname" name="Prénom">
                </label>
                <label for="lastname">
                    Nom
                    <input type="lastname" id="lastname" name="Nom">
                </label>
                <label for="email">
                    Email
                    <input type="text" id="email" name="Email">
                </label>
                <label for="message">
                    Votre message
                    <textarea id="message" name="Votre message" rows="6" cols="50"></textarea>
                </label>
                <button type="submit" aria-label="Envoyer">Envoyer</button>
                <p id="form_error"></p>
            </form>
        </div>`);
    // Affiche / Masquage de la modal
    let contactModal = document.querySelector('#contact_modal');
    contactModal.style.display = 'none';
    document.querySelector('#contact').addEventListener('click', () => contactModal.style.display = 'block');
    document.querySelector('#close_contact').addEventListener('click', () => contactModal.style.display = 'none');

    // Contrôle des champs du formulaire
    let form = document.querySelector('#contact_modal form')
    let firstName = document.querySelector('#firstname');
    let lastName = document.querySelector('#lastname');
    let email = document.querySelector('#email');
    let message = document.querySelector('#message');
    let errors = document.querySelector('#form_error');
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        errorMessages = [];
        textLenght(firstName);
        textLenght(lastName);
        emailValidFormat();
        textLenght(message);
        if(errorMessages.length === 0){
            showData();
            console.log(`Prénom: ${firstName.value}, Nom: ${lastName.value}, Message: ${message.value}`)
        }else{
            // Formulaire invalide -> messages affichés par fonctions précédantes, réinitialisation du tableau d'erreur(s) pour nouvelle soumission
            errors.innerHTML = 'Tous les champs doivent être complétés (> 2 caractères) et valides.';
            errorMessages = [];
        }
    });
    // Ajout de l'encart like+prix
    let likeSum = videosAndImages.reduce((accumulator, currentValue) => accumulator + currentValue.likes, 0);
    photographerPage.insertAdjacentHTML('beforeend',
    `<div id="price_and_likes">
        <span>${likeSum} <i class="las la-heart" aria-label="somme des likes"></i><span class="sr-only">likes</span></span> <span>${selectedPhotographer.price}€ / jour</span>
    </div>`);

    // ------------------------- SELECT / TRI DES MEDIA -----------------------
    // Ajout du template - section media - filtre
    photographerPage.insertAdjacentHTML('beforeend',
    `<section class="photoSection">
        <div class="photoSection__filter">
            Trier par
            <select id="sortMedia">
            </select>
        </div>
        <div class="photoSection__list" id="photoContent">
        </div>
    </section>`)
    // event pour le tri des media
    let sortMedia = document.querySelector("#sortMedia");
    sortMedia.addEventListener('change', () => {
        sortValue = sortMedia.options[sortMedia.selectedIndex].value;
        showData();
        addTagInPhotoPage();
    });
    //filtre des media via le select
    switch(sortValue){
        case 'Date':
            videosAndImages.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            sortMedia.innerHTML = `<option value="Date">Date</option>
                                   <option value="Popularity">Popularité <i class="las la-angle-down"></i></option>
                                   <option value="Title">Titre</option>`
            break;
        case 'Title':
            videosAndImages.sort((a, b) => {
                let concatA = a.title.toLowerCase().split(' ').join('');
                let concatB = b.title.toLowerCase().split(' ').join('');
                // console.log(concatA, concatB)
                if( concatA > concatB){
                    return 1;
                }else{
                    return -1;
                }
            });
            sortMedia.innerHTML = `<option value="Title">Titre</option>
                                   <option value="Popularity">Popularité <i class="las la-angle-down"></i></option>
                                   <option value="Date">Date</option>`
            break;
        case 'Popularity':
            videosAndImages.sort((a, b) => {
                return b.likes - a.likes;
            });
            sortMedia.innerHTML = `<option value="Popularity">Popularité <i class="las la-angle-down"></i></option>
                                   <option value="Date">Date</option>
                                   <option value="Title">Titre</option>`
            break;
        default: //par défaut tri par popularité
            videosAndImages.sort((a, b) => {
                return b.likes - a.likes;
            });
            sortMedia.innerHTML = `<option value="Popularity">Popularité <i class="las la-angle-down"></i></option>
                                   <option value="Date">Date</option>
                                   <option value="Title">Titre</option>`
            break;
    }
    // Ajout du template - section media - media
    let photographerPageMediaList = document.querySelector('.photoSection__list');
    videosAndImages.forEach((media, index) => {
        photographerPageMediaList.insertAdjacentHTML('beforeend',
        `<article class="photoSection__list__photoBloc">
            <figure>
                <a href="#" aria-label="${media.video}, lire la vidéo en gros plan" class="media_${index}" id="${index}">
                    <div class="photoSection__list__photoBloc__photo">
                        ${media.element}
                    </div>
                </a>
                <figcaption>
                    <h3>${media.title}</h3>
                    <div>
                        <span>${media.likes} <span class="sr-only">likes</span></span>
                        <a  id="likes_${index}" role="button" href="" aria-label="ajouter un like">
                            <i class="las la-heart"></i>
                        </a>
                    </div>
                </figcaption>
            </figure>
        </article>`)
        photographerPageMediaList.insertAdjacentHTML('beforeend',
            `<div id="media_modal">
                <section aria-label="Vue de l'image en grand">
                    <a href="" role="button" id="closeMediaModal" aria-label="fermer la modal">
                        <i class="las la-times"></i>
                    </a>
                    <a href="" role="button" aria-label="media précédent" id="la-angle-left">
                        <i class="las la-angle-left"></i>
                    </a>
                    <a href="" role="button" aria-label="media suivant" id="la-angle-right">
                        <i class="las la-angle-right"></i>
                    </a>
                    <figure>
                    </figure>
                </section>
            </div>`);
        let mediaElt = document.querySelector(`.media_${index}`);
        let mediaModal = document.querySelector('#media_modal');
        mediaElt.addEventListener('click', (e) => {
            e.preventDefault();
            let indexElt = index;
            mediaModal.style.display = 'flex'
            document.querySelector('#media_modal figure').innerHTML = `
                <div class="media__modal__photo">
                    ${videosAndImages[indexElt].element}
                </div>
                <figcaption>
                    ${videosAndImages[indexElt].title}
                </figcaption>`;
            addControls(videosAndImages[indexElt]);
            document.querySelector('#closeMediaModal').addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('#media_modal figure').innerHTML = '';
                mediaModal.style.display = 'none';
            });
            document.querySelector('#la-angle-left').addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('#media_modal figure').innerHTML = `
                <div class="media__modal__photo">
                    ${videosAndImages[indexElt-1].element}
                </div>
                <figcaption>
                    ${videosAndImages[indexElt-1].title}
                </figcaption>`;
                addControls(videosAndImages[indexElt-1]);
                indexElt--;
            })
            document.querySelector('#la-angle-right').addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('#media_modal figure').innerHTML = `
                <div class="media__modal__photo">
                    ${videosAndImages[indexElt+1].element}
                </div>
                <figcaption>
                    ${videosAndImages[indexElt+1].title}
                </figcaption>`;
                addControls(videosAndImages[indexElt+1]);
                indexElt++;
            })
            // navigation au clavier
            mediaModal.addEventListener('keydown',(e)=> {
                e.preventDefault();
                switch (e.code)
                {
                    case 'ArrowLeft':
                        document.querySelector('#media_modal figure').innerHTML = `
                        <div class="media__modal__photo">
                            ${videosAndImages[indexElt-1].element}
                        </div>
                        <figcaption>
                            ${videosAndImages[indexElt-1].title}
                        </figcaption>`;
                        addControls(videosAndImages[indexElt-1]);
                        indexElt--;
                        break;

                    case 'ArrowRight':
                        document.querySelector('#media_modal figure').innerHTML = `
                        <div class="media__modal__photo">
                            ${videosAndImages[indexElt+1].element}
                        </div>
                        <figcaption>
                            ${videosAndImages[indexElt+1].title}
                        </figcaption>`;
                        addControls(videosAndImages[indexElt+1]);
                        indexElt++;
                        break;

                    case 'Escape':
                        document.querySelector('#media_modal figure').innerHTML = '';
                        mediaModal.style.display = 'none';
                        break;
                }
            });
            function addControls(media){
                if(media.video){
                    document.querySelector('.media__modal__photo video').setAttribute("controls", "")
                }
            }
            document.querySelector('#closeMediaModal').focus();
        })
        let likeIcon = document.querySelector(`#likes_${index}`);
        likeIcon.addEventListener('click', (e) => {
            e.preventDefault();
            addLike(media);
            showData();
            addTagInPhotoPage();
        });
    })
}

const addTagInPhotoPage = () => {
    let tagsInCurrentPhotographer = document.querySelector(`#tagGroup`);
    selectedPhotographer.tags.forEach(tag => tagsInCurrentPhotographer.insertAdjacentHTML('beforeend', `<span class="sr-only">tag#</span> <a class="tag" href="index.html?tag=${tag}">${tag}</a>`))
}

async function main(){
    await getMediaData();
    showData();
    addTagInPhotoPage();
    enterEqualCLick();
}

if(photographerPage){
    main();
}



// Fonctions de contrôle du formulaire
let textFormat = /^[A-zÀ-ú][A-zÀ-ú\'\-]{1,100}/;
let mailFormat = /\S+@\S+\.\S+/;

const textLenght = (text) => {
    if (text.value.trim() === "" || !text.value.match(textFormat)){
        text.style.border = "2px solid red";
        errorMessages.push('erreur text');
    } else {
        text.style.border = "2px solid green";
    }
}

const emailValidFormat = () => {
    if(email.value.match(mailFormat)){
        email.style.border = "2px solid green";
    }else{
        email.style.border = "2px solid red";
        errorMessages.push('erreur email');
    }
}