const menuToggle = document.getElementById("menuToggle")
const navLinks = document.querySelector(".nav-links")

menuToggle.addEventListener("click", () => {

navLinks.classList.toggle("active")

})

/* SCROLL ANIMATION */

const cards = document.querySelectorAll(".card")

const observer = new IntersectionObserver(entries => {

entries.forEach(entry => {

if(entry.isIntersecting){

entry.target.style.transform = "translateY(0)"
entry.target.style.opacity = 1

}

})

})

cards.forEach(card => {

card.style.transform = "translateY(40px)"
card.style.opacity = 0
card.style.transition = "all 0.6s ease"

observer.observe(card)

})