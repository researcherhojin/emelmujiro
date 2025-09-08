// Cache cleanup script to remove old service workers and caches
(function () {
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister().then(function (success) {
          if (success) {
            console.log('Service Worker unregistered:', registration.scope);
          }
        });
      }
    });
  }

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          return caches.delete(cacheName).then(function (success) {
            if (success) {
              console.log('Cache deleted:', cacheName);
            }
          });
        })
      );
    });
  }

  // Clear localStorage and sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Storage cleared');
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
})();
