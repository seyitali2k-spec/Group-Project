
const form = document.getElementById('form')
const entries = document.querySelector("#entries")
const totalMgDisplay = document.querySelector("#total-mg")
const warning = document.querySelector("#warning")

const dbURL = `http://localhost:3000`

async function fetchDrinks (){ 
    const data = await fetch (`${dbURL}/api/drinks`)
    const drinksTable = await data.json ()
    console.log(drinksTable)

    return drinksTable

}

async function formSubmission (event){
    event.preventDefault() 

    const formData = new FormData(form)
    const input = Object.fromEntries(formData)
    const inputJSON = JSON.stringify(input)

    const post = await fetch(`${dbURL}/api/drinks`, {
    headers: {
      "Content-Type" : "application/json"
    },
    method: "POST",
    body: inputJSON
  })
  window.location.reload()

}

form.addEventListener(`submit`,formSubmission)

async function displayDrinks() {
  const drinks = await fetchDrinks();
  entries.innerHTML = "";

  drinks.forEach((drink) => {
    const entry = document.createElement("div");
    entry.classList.add("entry");
    entry.textContent = `${drink.drink_name} - ${drink.caffeine_mg} mg`;
    entries.appendChild(entry);
  });
}

displayDrinks();


async function fetchStats() {
  const data = await fetch(`${dbURL}/api/drinks/stats/today`);
  const stats = await data.json()

  return stats
}

async function displayStats() {
  const stats = await fetchStats();
  TotalMgDisplay.textContent = stats.total_caffeine;

  if (stats.total_caffeine > 400) {
    warning.style.display = "block";
  } else {
    warning.style.display = "none";
  }
}

async function fetchPresets() {
    const data = await fetch(`${dbURL}/api/drinks/presets`);
    const presets = await data.json()


    return presets
}