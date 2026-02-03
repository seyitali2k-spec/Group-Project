const dailyLimit = 400;
let i = 0;

function move() {
    let caffeineAmount = Number(document.getElementById("caffeine_mg").value);
    let percentage = (caffeineAmount / dailyLimit) * 100;

    if (percentage > 100) percentage = 100;

    
        let warning = document.getElementById("warning");
        if(percentage >= 100) {
            warning.style.display = "block";
        } else {
            warning.style.display = "none";
        }

    if (i===0) {
        i = 1;
        let element = document.getElementById('myBar')
        let width = 1;

        if (percentage < 50) {
            element.style.background = "linear-gradient(90deg, #6f4e37, #8b5e3c)";
        } else if (percentage < 80) {
            element.style.background = "linear-gradient(90deg, #c68b59, #d9a066)";
        } else {
            element.style.background = "linear-gradient(90deg, #d9534f, #b52b27"
        }
        let id = setInterval(frame, 10);
        function frame() {
            if(width >= percentage) {
                clearInterval(id)
                i = 0;
            } else {
                width++;
                element.style.width = width + "%";
            }
        }
    }
}