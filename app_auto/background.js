const firebaseConfig = {
    apiKey: "AIzaSyDaAWyEsDx-QTAKGOQS8wamKKn61L5f8hY",
    authDomain: "ntucovid2021.firebaseapp.com",
    projectId: "ntucovid2021",
    storageBucket: "ntucovid2021.appspot.com",
    messagingSenderId: "268933634464",
    appId: "1:268933634464:web:2caf42e8b4e76b8995ecc5",
    measurementId: "G-SF6J7SMJZR"
  };

firebase.initializeApp(firebaseConfig);


let user_signed_in = false;

// chrome.browserAction.onClicked.addListener(function () {
//     chrome.windows.create({
//         url: './popup.html',
//         width: 300,
//         height: 600,
//         focused: true
//     });
// })

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'is_user_signed_in') {
        sendResponse({
            message: 'success',
            payload: user_signed_in
        });
    } else if (request.message === 'sign_out') {
        user_signed_in = false;
        sendResponse({ message: 'success' });
    } else if (request.message === 'sign_in') {
        user_signed_in = true;
        sendResponse({ message: 'success' });
    }

    return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'user_signed_in_status' && user_signed_in) {
        sendResponse({ message: 'success' });
    }
    return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'request_user_email') {
        const user = firebase.auth().currentUser;
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            const email = user.email;
            sendResponse({ message: email });
            // ...
        } else {
             // User is signed out
             // ...
            sendResponse({ message: 'status_not_updated' });
        }

    }
    return true;
});