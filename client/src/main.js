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

const dailyLimit = 400;

async function fetchStats() {
  const data = await fetch(`${dbURL}/api/drinks/stats/today`);
  const stats = await data.json()

  return stats
}

async function displayStats() {
  const stats = await fetchStats();
  totalMgDisplay.textContent = stats.total_caffeine;

  const percentage = (stats.total_caffeine / dailyLimit) * 100;
  const cappedPercentage = Math.min (percentage, 100)

  if (percentage >= 100) {
    warning.style.display = "block";
  } else {
    warning.style.display = "none";
  }

  const element = document.getElementById("myBar");

  if (percentage < 50) {
    element.style.background = "linear-gradient(90deg, #6f4e37, #8b5e3c)";
  } else if (percentage < 80) {
    element.style.background = "linear-gradient(90deg, #c68b59, #d9a066)";
  } else {
    element.style.background = "linear-gradient(90deg, #d9534f, #b52b27)";
  }

  element.style.width = cappedPercentage + "%";

}

async function fetchPresets() {
    const data = await fetch(`${dbURL}/api/drinks/presets`);
    const presets = await data.json()


    return presets
}

displayStats();