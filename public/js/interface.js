let options = document.getElementById("options");
let query = window.matchMedia("(max-width: 600px)");

document.addEventListener("click", () => {
    if(query.matches) {
        let optionsDiv  = document.getElementsByClassName("headerPartner");
        optionsDiv[0].style.height = "38px"
        optionsDiv[0].style.width = "40px"
        optionsDiv[0].style.left = `${(window.innerWidth / 2) - 20}px`;
        optionsDiv[0].style.top = `${(window.innerHeight * 0.95) - 32}px`;
    } else {
        let optionsDiv  = document.getElementsByClassName("headerPartner");
        optionsDiv[0].style.height = "32px"
    }
})

options.addEventListener("click", (e) => {
    if(query.matches) {
        let optionsDiv  = document.getElementsByClassName("headerPartner");
        optionsDiv[0].style.width = "200px"
        optionsDiv[0].style.left = `${(window.innerWidth / 2) - 100}px`;
        e.stopPropagation();
    } else {
        let optionsDiv  = document.getElementsByClassName("headerPartner");
        optionsDiv[0].style.height = "190px"
        e.stopPropagation();
    }
});



window.addEventListener('load', function() {
        if(query.matches) {
            let optionsDiv  = document.getElementsByClassName("headerPartner");
            optionsDiv[0].style.top = `${(window.innerHeight * 0.95) - 32}px`;
        }
});

window.addEventListener('resize', function() {
    if(query.matches) {
        let optionsDiv  = document.getElementsByClassName("headerPartner");
        optionsDiv[0].style.top = `${(window.innerHeight * 0.95) - 32}px`;
    }
});