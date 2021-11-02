// Global selections
const colorDivs = document.querySelectorAll('.color');
const currentHex = document.querySelectorAll('.color h2');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range');
let initialColors;
const popup = document.querySelector('.copy-container');
const adjustBtns = document.querySelectorAll('.adjust');
const lockBtns = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');

// This is the array of objects for the local storage
let savedPalettes = [];

// Event Listeners
sliders.forEach(slider => {
  slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener('input', () => {
    updateTextUI(index);
  })
})

currentHex.forEach(hex => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  })
});

popup.addEventListener('transitionend', () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
})

adjustBtns.forEach((button, index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  })
})

closeAdjustments.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  })
})

generateBtn.addEventListener('click', generateColors);

lockBtns.forEach((button, index) => {
  button.addEventListener("click", e => {
    lockLayer(e, index);
  });
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
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    // add a generated random color to the initialcolors array
    if (div.classList.contains('locked')) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }



    // add the color to the bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // check and adjust the contrast of the text of the color
    checkContrast(randomColor, hexText);

    // Initial colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  // Reset inputs
  resetInputs();

  // Check contrast of buttons
  adjustBtns.forEach((button, index) => {
    checkContrast(initialColors[index], button);
    checkContrast(initialColors[index], lockBtns[index]);
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

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // colorize input sliders
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2');
  const icons = activeDiv.querySelectorAll('.controls button');
  textHex.innerText = color.hex();
  // check contrast
  checkContrast(color, textHex);
  for (icon of icons) {
    checkContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach(slider => {
    if (slider.name === 'hue') {
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }

    if (slider.name === 'saturation') {
      const satColor = initialColors[slider.getAttribute('data-sat')];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }

    if (slider.name === 'brightness') {
      const brightColor = initialColors[slider.getAttribute('data-bright')];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }

  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // Popup animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

// Implement save to Palette and local storage
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');

// Event listeners
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);

// Functions
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function savePalette(e) {
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
  const name = saveInput.value;
  const colors = [];
  currentHex.forEach(hex => {
    colors.push(hex.innerText);
  });
  // Generate Object
  let paletteNr = savedPalettes.length;
  const paletteObj = {
    name,
    colors,
    nr: paletteNr
  };
  savedPalettes.push(paletteObj);
  // Save to LocalStorage
  savetoLocal(paletteObj);
  saveInput.value = "";
}

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));

}

generateColors();