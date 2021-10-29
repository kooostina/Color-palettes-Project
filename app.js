// Global selections
const colorDivs = document.querySelectorAll('.color');
const currentHex = document.querySelectorAll('.color h2');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range');

// Event Listeners
sliders.forEach(slider => {
  slider.addEventListener('input', hslControls);
});

// Functions

// to generate a random color in pure JS
// function generateHex() {
//   const letters = "0123456789ABCDEF";
//   let hash = "#";

//   for (let i = 0; i < 6; i++) {
//     hash += letters[Math.floor(Math.random() * 16)];
//   }

//   return hash;
// }

// to generate a random color with the help of Chroma JS library
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

// to add generated colors to the div backgrounds
function generateColors() {
  colorDivs.forEach((div, index) => {
    const randomColor = generateHex();
    const hexText = div.children[0];
    // const controlsBtns = div.children[1];
    // console.log(controlsBtns);

    // add the color to the bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    // controlsBtns.style.color = randomColor;

    // check and adjust the contrast of the text of the color
    checkContrast(randomColor, hexText);
    // checkContrast(randomColor, controlsBtns);

    // Initial colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  })
}

function checkContrast(color, text) {
  const luminance = chroma(color).luminance();

  if (luminance < 0.5) {
    text.style.color = "white";
  } else {
    text.style.color = "black";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // Saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const satScale = chroma.scale([noSat, color, fullSat]);

  // Brightness
  const midBright = color.set("hsl.l", 0.5);
  const brightScale = chroma.scale(["black", midBright, "white"]);

  // Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${satScale(0)}, ${satScale(1)})`;

  brightness.style.backgroundImage = `linear-gradient(to right, ${brightScale(0)}, ${brightScale(0.5)}, ${brightScale(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right,rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75)
)`;
}

function hslControls(e) {
  const index = e.target.getAttribute("data-bright") || e.target.getAttribute("data-sat") || e.target.getAttribute("data-hue");

  const sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = colorDivs[index].querySelector("h2").innerText;
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  
  colorDivs[index].style.backgroundColor = color;
    
}

generateColors();