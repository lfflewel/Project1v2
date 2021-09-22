// random
const loginCover = document.getElementById("loginCover");
const signupCover = document.getElementById("signupCover");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// hide the login/sign up form 

function toggleLoginSignup(location) {
    if (location === "login") {
        loginCover.classList.add("hide");
        loginForm.classList.remove("hide");
        signupForm.classList.add("hide");
        signupCover.classList.remove("hide");
    }
    else if (location == "signup") {
        signupCover.classList.add("hide");
        signupForm.classList.remove("hide");
        loginForm.classList.add("hide");
        loginCover.classList.remove("hide")
    }
}

// -----------