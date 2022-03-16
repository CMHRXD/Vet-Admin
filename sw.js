const cacheName = 'apv-v10';
const assets = [
    './',
    './index.html',
    './error.html',
    './css/bootstrap.min.css',
    './css/styles.css',
    './js/app.js',
    './js/apv.js',
];

//When Service Worker installs
self.addEventListener('install', event =>{
    console.log('Instalando el Service Worker');
    // Wait until all the files are downloaded and added to cache
    event.waitUntil( 
        caches.open(cacheName)
            .then( cache => cache.addAll(assets))
    )
});

//Activate Service Worker
self.addEventListener('activate',event =>{
    console.log('Service Worker Activated');
    // Update PWA //
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(keys
                        .filter(key => key !== cacheName)
                        .map(key => caches.delete(key)) // delete the other versions
                    )
            })
    )
});

//Fetch static files
self.addEventListener('fetch', event=>{
   // console.log('fetch...', e);
   event.respondWith(
        caches.match(event.request)
            .then(response => {
                if(response.status){
                    return response
                } 
            })
            .catch(() => caches.match('./error.html'))
    );

})