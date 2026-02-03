
const display = document.getElementById('form')

const dbURL = `http://localhost:3000`

async function fetchData (){ 
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

    const post = await fetch(`${dbURL}//api/drinks`, {
    headers: {
      "Content-Type" : "application/json"
    },
    method: "POST",
    body: inputJSON
  })
  window.location.reload()

}

form.addEventListener(`submit`,formSubmission)