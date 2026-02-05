const form = document.getElementById('form')
const entries = document.querySelector("#entries")
const totalMgDisplay = document.querySelector("#total-mg")
const warning = document.querySelector("#warning")

const dbURL = `https://group-project-api-83q0.onrender.com`

// Error handling helper
function showError(message) {
    alert(message);
    console.error(message);
}

async function fetchDrinks() {
    try {
        const response = await fetch(`${dbURL}/api/drinks`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch drinks: ${response.status}`);
        }
        
        const drinksTable = await response.json();
        console.log(drinksTable);
        return drinksTable;
    } catch (error) {
        showError("Unable to load drinks. Please check your connection.");
        console.error(error);
        return [];
    }
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

async function formSubmission(event) {
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

    try {
        const response = await fetch(`${dbURL}/api/drinks`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(submission)
        });

        if (!response.ok) {
            throw new Error(`Failed to add drink: ${response.status}`);
        }

        //  refresh the UI after successful submission
        await displayDrinks();
        await displayStats();
        
        // Reset the form
        form.reset();
        selectPreset.value = "";
        
    } catch (error) {
        showError("Unable to add drink. Please try again.");
        console.error(error);
    }
}

form.addEventListener(`submit`, formSubmission)

async function deleteDrink(id) {
    try {
        const response = await fetch(`${dbURL}/api/drinks/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Failed to delete drink: ${response.status}`);
        }
    } catch (error) {
        showError("Unable to delete drink. Please try again.");
        console.error(error);
        throw error; // Re-throw so the caller knows it failed
    }
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

        deleteBtn.addEventListener('click', async () => {
            try {
                await deleteDrink(drink.id);
                await displayDrinks();
                await displayStats();
            } catch (error) {
                // Error already shown in deleteDrink
            }
        });
        
        entry.appendChild(text);
        entry.appendChild(deleteBtn);
        entries.appendChild(entry);
    });
}

displayDrinks();

const dailyLimit = 400;

async function fetchStats() {
    try {
        const response = await fetch(`${dbURL}/api/drinks/stats/today`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        
        const stats = await response.json();
        return stats;
    } catch (error) {
        console.error("Unable to load stats:", error);
        return { total_caffeine: 0 }; // Return default value
    }
}

async function displayStats() {
    const stats = await fetchStats();
    totalMgDisplay.textContent = stats.total_caffeine;

    const percentage = (stats.total_caffeine / dailyLimit) * 100;
    const cappedPercentage = Math.min(percentage, 100)

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
    try {
        const response = await fetch(`${dbURL}/api/drinks/presets`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch presets: ${response.status}`);
        }
        
        const presets = await response.json();
        return presets;
    } catch (error) {
        showError("Unable to load drink presets.");
        console.error(error);
        return [];
    }
}

async function loadPresets() {
    const presets = await fetchPresets();

    presets.forEach(drink => {
        const option = document.createElement("option");
        option.value = drink.id;
        option.textContent = `${drink.name} - ${drink.caffeine_mg} mg`;
        selectPreset.appendChild(option);
    });
}

loadPresets();
displayStats();
