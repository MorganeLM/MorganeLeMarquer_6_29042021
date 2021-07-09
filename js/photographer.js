async function showPhotographer() {

    // read our JSON
    let response = await fetch('/js/data.json');
    let data = await response.json();
    let photographers = data.photographers;

    // search photographer
    const currentPhotographerId = new URL(window.location.href).searchParams.get('id');
    let photographerId = parseInt(currentPhotographerId);
    // let photographer = photographers.find((element) => element.id === photographerId);
    // console.log(photographers[0].id);
    let photographer;
    photographers.forEach(element => {
        if(element.id === photographerId){
            photographer = element;
            return photographer;
        }
    });
    console.log(photographer);


    // show the avatar
    // let img = document.createElement('img');
    // img.src = githubUser.avatar_url;
    // img.className = "promise-avatar-example";
    // document.body.append(img);
  
    // return githubUser;
  }
  
  showPhotographer();

//   async function fetchMoviesAndCategories() {
//     const [moviesResponse, categoriesResponse] = await Promise.all([    fetch('/movies'),    fetch('/categories')  ]);
//     const movies = await moviesResponse.json();
//     const categories = await categoriesResponse.json();
  
//     return [movies, categories];
//   }
  
//   fetchMoviesAndCategories().then(([movies, categories]) => {
//     movies;     // fetched movies
//     categories; // fetched categories
//   }).catch(error => {
//     // /movies or /categories request failed
//   });

