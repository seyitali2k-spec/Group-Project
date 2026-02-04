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

const presetLabel = document.createElement("label");
presetLabel.textContent = "Choose a drink:";
presetLabel.setAttribute("for", "preset");

const selectPreset = document.createElement("select")
selectPreset.id = 'preset' 

const defaultOption = document.createElement("option")
defaultOption.value = ""
defaultOption.textContent = "-- Select a drink --"
selectPreset.appendChild(defaultOption)

form.prepend(selectPreset);
form.prepend(presetLabel);

async function formSubmission (event){
    event.preventDefault() 

    const selectedPresetId = selectPreset.value;
    const formData = new FormData(form)
    const input = Object.fromEntries(formData)

     let submission;

  if (selectedPresetId) {
    
    submission = { drink_id: Number(selectedPresetId) };
  } else if (input.custom_name && input.custom_caffeine_mg) {

    submission = {
      custom_name: input.custom_name,
      custom_caffeine_mg: Number(input.custom_caffeine_mg)
    };
  } else {
    alert("Please select a drink or enter a custom drink!");
    return;
  }

    const post = await fetch(`${dbURL}/api/drinks`, {
    headers: {
      "Content-Type" : "application/json"
    },
    method: "POST",
    body: JSON.stringify(submission)
  })

}

form.addEventListener(`submit`,formSubmission)

async function deleteDrink(id) {
  await fetch (`${dbURL}/api/drinks/${id}`, {
    method: "DELETE"
  });
}

async function displayDrinks() {
  const drinks = await fetchDrinks();
  entries.innerHTML = "";

  drinks.forEach((drink) => {
    const entry = document.createElement("div");
    entry.classList.add("entry");

  const text = document.createElement('span');
  text.textContent = `${drink.drink_name} - ${drink.caffeine_mg} mg`;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✖';
  deleteBtn.classList.add('delete-btn');

  deleteBtn.addEventListener('click', async ()=> {
    await deleteDrink(drink.id); 
    displayDrinks();
    displayStats();
  });
  entry.appendChild(text);
  entry.appendChild(deleteBtn);
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
async function loadPresets() {

  const presets = await fetchPresets()

    presets.forEach(drink => {
      const option = document.createElement("option");
      option.value = drink.id; 
      option.textContent = `${drink.name} - ${drink.caffeine_mg} mg`;
      selectPreset.appendChild(option);
    });
  
}
loadPresets();
displayStats();
