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

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());

const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            chrome.runtime.sendMessage({ message: 'sign_in' }, function (response) {
                if (response.message === 'success') {
                    window.location.replace('./main.html');
                }
            });
            return false;
        },
        uiShown: function () {
            document.getElementById('my_sign_in').style.display = 'none';
            document.getElementById('wrapper').style.pointerEvents = 'none';
        }
    },
    signInFlow: 'popup',
    // signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            customParameters: {
                prompt: 'select_account'
            }
        },
        // {
        //     provider: firebase.auth.GithubAuthProvider.PROVIDER_ID,
        //     customParameters: {
        //         prompt: 'consent'
        //     }
        // },
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    // tosUrl: '<your-tos-url>',
    // Privacy policy url.
    // privacyPolicyUrl: '<your-privacy-policy-url>'
};

document.querySelector('#wrapper').addEventListener('click', () => {
    ui.start('#sign_in_options', uiConfig);
});

document.querySelector('#wrapper').addEventListener('mouseover', () => {
    let sign_in = document.querySelector('#my_sign_in');
    sign_in.classList.remove('sign_in_no_hover');
    sign_in.classList.add('sign_in_hover');
});

document.querySelector('#wrapper').addEventListener('mouseleave', () => {
    let sign_in = document.querySelector('#my_sign_in');
    sign_in.classList.remove('sign_in_hover');
    sign_in.classList.add('sign_in_no_hover');
});


