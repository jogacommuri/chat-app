importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB6fVZaZEL8YuD3dJUes9az4M2uXYaBpto",
    authDomain: "chat-messaging-fe7bb.firebaseapp.com",
    projectId: "chat-messaging-fe7bb",
    storageBucket: "chat-messaging-fe7bb.appspot.com",
    messagingSenderId: "967172716397",
    appId: "1:967172716397:web:c17bc767591183c7d80c64",
    measurementId: "G-NWBJMC3CZP"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: 'icon.png', // Replace with your app's icon
  });
});
