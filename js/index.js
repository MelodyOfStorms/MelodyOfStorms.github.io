"use strict";
//collision groups
//   cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet | cat.mobShield
const cat = {
  player: 0x1,
  map: 0x10,
  body: 0x100,
  bullet: 0x1000,
  powerUp: 0x10000,
  mob: 0x100000,
  mobBullet: 0x1000000,
  mobShield: 0x10000000,
}

//build build grid display
const build = {
  choosePowerUp(who, index, type) {

    //       mech.setField(build.list[i].index)
    //       b.giveGuns(build.list[i].index)
    //       b.giveMod(build.list[i].index)


    if (type === "field" || type === "gun") {
      let isDeselect = false
      //if already click, toggle off
      for (let i = 0; i < build.list.length; i++) {
        if (build.list[i].index === index && build.list[i].type === type) {
          build.list.splice(i, 1);
          who.style.backgroundColor = "#fff"
          isDeselect = true
          break
        }
      }
      //check if trying to get a second field
      if (type === "field") {
        mech.setField(index)
        for (let i = 0; i < build.list.length; i++) {
          if (build.list[i].type === "field") { //if already click, toggle off
            build.list[i].who.style.backgroundColor = "#fff"
            build.list.splice(i, 1);
          }
        }
      }
      if (!isDeselect) {
        who.style.backgroundColor = "#919ba8" //"#868f9a"
        build.list[build.list.length] = {
          who: who,
          index: index,
          type: type,
        }
      }
    } else if (type === "mod") {
      if (who.style.backgroundColor !== "#919ba8") who.style.backgroundColor = "#919ba8" //"#868f9a"
      //if already clicked graphically indicate recursive clicks
      let count = 0
      for (let i = 0; i < build.list.length; i++) {
        if (build.list[i].type === "mod" && build.list[i].index === index) {
          count++
        }
      }
      if (count < b.mods[index].maxCount) {
        //add mod to build list
        build.list[build.list.length] = {
          who: who,
          index: index,
          type: type,
        }
        count++
        //display mod count in grid box text
        if (count > 1) who.innerHTML = `<div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${b.mods[index].name} (${count}x)</div> ${b.mods[index].description}`
      } else {
        //when above the mod limit remove all of that mod
        for (let i = build.list.length - 1; i > -1; i--) {
          if (build.list[i].index === index && build.list[i].type === type) {
            build.list.splice(i, 1);
          }
        }
        //and reset the text
        who.style.backgroundColor = "#fff"
        who.innerHTML = `<div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${b.mods[index].name}</div> ${b.mods[index].description}`
      }
    }
    // document.title = `effective starting level: ${build.list.length * game.difficultyMode}`
    // build.calculateCustomDifficulty()
  },
  populateGrid() {
    let text = `
  <div style="display: flex; justify-content: space-around; align-items: center;">
    <svg class="SVG-button" onclick="build.startBuildRun()" width="115" height="51">
      <g stroke='none' fill='#333' stroke-width="2" font-size="40px" font-family="Ariel, sans-serif">
        <text x="18" y="38">start</text>
      </g>
    </svg>
    <svg class="SVG-button" onclick="build.reset()" width="70" height="35">
      <g stroke='none' fill='#333' stroke-width="2" font-size="22px" font-family="Ariel, sans-serif">
        <text x="10" y="24">reset</text>
      </g>
    </svg>
  </div>
  <div style="align-items: center; text-align:center; font-size: 1.00em; line-height: 220%;background-color:#c4ccd8;">
    <div>starting level: <input id='starting-level' type="number" step="1" value="0" min="0" max="99"></div>
    <label for="difficulty-select" title="effects: number of mobs, damage done by mobs, damage done to mobs, mob speed, heal effects">difficulty:</label>
    <select name="difficulty-select" id="difficulty-select-custom">
      <option value="0">easy</option>
      <option value="1" selected>normal</option>
      <option value="2">hard</option>
      <option value="4">why...</option>
    </select>
  </div>`
    for (let i = 1, len = mech.fieldUpgrades.length; i < len; i++) {
      text += `<div class="build-grid-module" onclick="build.choosePowerUp(this,${i},'field')"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${mech.fieldUpgrades[i].name}</div> ${mech.fieldUpgrades[i].description}</div>`
    }
    for (let i = 0, len = b.guns.length; i < len; i++) {
      text += `<div class="build-grid-module" onclick="build.choosePowerUp(this,${i},'gun')"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[i].name}</div> ${b.guns[i].description}</div>`
    }
    for (let i = 0, len = b.mods.length; i < len; i++) {
      if (
        !b.mods[i].allowed() ||
        b.mods[i].name === "+1 cardinality" || b.mods[i].name === "leveraged investment"
      ) {
        text += `<div class="build-grid-module" style="opacity:0.3;"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${b.mods[i].name}</div> ${b.mods[i].description}</div>`
      } else {
        text += `<div class="build-grid-module" onclick="build.choosePowerUp(this,${i},'mod')"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${b.mods[i].name}</div> ${b.mods[i].description}</div>`
      }
    }
    document.getElementById("build-grid").innerHTML = text
  },
  reset() {
    build.populateGrid();

    document.getElementById("difficulty-select-custom").value = localSettings.difficultyMode
    document.getElementById("difficulty-select-custom").addEventListener("input", () => {
      document.getElementById("difficulty-select").value = document.getElementById("difficulty-select-custom").value
      game.difficultyMode = Number(document.getElementById("difficulty-select-custom").value)
      localSettings.difficultyMode = game.difficultyMode
      localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
      // build.calculateCustomDifficulty()
    });

    document.getElementById("build-grid").style.display = "grid"
    // build.calculateCustomDifficulty()
    document.getElementById("difficulty-select-custom").value = localSettings.difficultyMode
  },

  startBuildRun() {
    spawn.setSpawnList(); //gives random mobs,  not starter mobs
    spawn.setSpawnList();
    const increase = Number(document.getElementById("starting-level").value) * game.difficultyMode
    level.levelsCleared += increase;
    level.difficultyIncrease(increase) //increase difficulty based on modes
    document.body.style.cursor = "none";
    document.body.style.overflow = "hidden"
    document.getElementById("build-grid").style.display = "none"
    game.paused = false;
    requestAnimationFrame(cycle);
  },
  pauseGrid() {
    // let text = `<div class="pause-grid-module" style="border:0px;background:none;"></div>`
    let text = `
    <div class="pause-grid-module">
      <span style="font-size:1.5em;font-weight: 600;">PAUSED</span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; press P to resume
    </div>`;
    // <div class="pause-grid-module" style="display: flex; justify-content: space-between;padding-bottom:20px;">
    // <span>${game.SVGleftMouse} fire gun</span>
    // <span>${game.SVGrightMouse} use field</span>
    // </div>
    let countGuns = 0
    let countMods = 0
    for (let i = 0, len = b.guns.length; i < len; i++) {
      if (b.guns[i].have) {
        text += `<div class="pause-grid-module"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[i].name}</div> ${b.guns[i].description}</div>`
        countGuns++
      }
    }
    let el = document.getElementById("pause-grid-left")
    el.style.display = "grid"
    el.innerHTML = text

    text = "";
    text += `<div class="pause-grid-module"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${mech.fieldUpgrades[mech.fieldMode].name}</div> ${mech.fieldUpgrades[mech.fieldMode].description}</div>`
    for (let i = 0, len = b.mods.length; i < len; i++) {
      if (b.mods[i].count > 0) {
        if (b.mods[i].count === 1) {
          text += `<div class="pause-grid-module"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${b.mods[i].name}</div> ${b.mods[i].description}</div>`
        } else {
          text += `<div class="pause-grid-module"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${b.mods[i].name} (${b.mods[i].count}x)</div> ${b.mods[i].description}</div>`
        }
        countMods++
      }
    }
    el = document.getElementById("pause-grid-right")
    el.style.display = "grid"
    el.innerHTML = text
    if (countMods > 5 || countGuns > 6) {
      document.body.style.overflowY = "scroll";
      document.body.style.overflowX = "hidden";
    }
  },
  unPauseGrid() {
    document.body.style.overflow = "hidden"
    document.getElementById("pause-grid-left").style.display = "none"
    document.getElementById("pause-grid-right").style.display = "none"
  },
}

document.getElementById("build-button").addEventListener("click", () => { //setup build run
  document.getElementById("build-button").style.display = "none";
  const el = document.getElementById("build-grid")
  el.style.display = "grid"
  document.body.style.overflowY = "scroll";
  document.body.style.overflowX = "hidden";
  document.getElementById("info").style.display = 'none'

  level.isBuildRun = true;
  game.startGame(); //starts game, but pauses it
  game.paused = true;
  build.reset();
});


//  local storage
let localSettings = JSON.parse(localStorage.getItem("localSettings"));
// console.log(localSettings)
if (localSettings) {
  game.isBodyDamage = localSettings.isBodyDamage
  document.getElementById("body-damage").checked = localSettings.isBodyDamage

  game.difficultyMode = localSettings.difficultyMode
  document.getElementById("difficulty-select").value = localSettings.difficultyMode

  if (localSettings.fpsCapDefault === 'max') {
    game.fpsCapDefault = 999999999;
  } else {
    game.fpsCapDefault = Number(localSettings.fpsCapDefault)
  }
  document.getElementById("fps-select").value = localSettings.fpsCapDefault
} else {
  localSettings = {
    isBodyDamage: true,
    difficultyMode: '1',
    fpsCapDefault: '72',
  };
  localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
  document.getElementById("body-damage").checked = localSettings.isBodyDamage
  document.getElementById("difficulty-select").value = localSettings.difficultyMode
  document.getElementById("fps-select").value = localSettings.fpsCapDefault
}

//set up canvas
var canvas = document.getElementById("canvas");
//using "const" causes problems in safari when an ID shares the same name.
const ctx = canvas.getContext("2d");
document.body.style.backgroundColor = "#fff";

//disable pop up menu on right click
document.oncontextmenu = function () {
  return false;
}

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.width2 = canvas.width / 2; //precalculated because I use this often (in mouse look)
  canvas.height2 = canvas.height / 2;
  canvas.diagonal = Math.sqrt(canvas.width2 * canvas.width2 + canvas.height2 * canvas.height2);
  ctx.font = "15px Arial";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // ctx.lineCap='square';
  game.setZoom();
}
setupCanvas();
window.onresize = () => {
  setupCanvas();
};

//mouse move input
document.body.addEventListener("mousemove", (e) => {
  game.mouse.x = e.clientX;
  game.mouse.y = e.clientY;
});

document.body.addEventListener("mouseup", (e) => {
  // game.buildingUp(e); //uncomment when building levels
  // game.mouseDown = false;
  // console.log(e)
  if (e.which === 3) {
    game.mouseDownRight = false;
  } else {
    game.mouseDown = false;
  }
});

document.body.addEventListener("mousedown", (e) => {
  if (e.which === 3) {
    game.mouseDownRight = true;
  } else {
    game.mouseDown = true;
  }
});

//keyboard input
const keys = [];
document.body.addEventListener("keydown", (e) => {
  keys[e.keyCode] = true;
  if (mech.alive) game.keyPress();
});

document.body.addEventListener("keyup", (e) => {
  keys[e.keyCode] = false;
});

document.body.addEventListener("wheel", (e) => {
  if (!game.paused) {
    if (e.deltaY > 0) {
      game.nextGun();
    } else {
      game.previousGun();
    }
  }
}, {
  passive: true
});

document.getElementById("fps-select").addEventListener("input", () => {
  let value = document.getElementById("fps-select").value
  if (value === 'max') {
    game.fpsCapDefault = 999999999;
  } else {
    game.fpsCapDefault = Number(value)
  }
  localSettings.fpsCapDefault = value
  localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
});

document.getElementById("body-damage").addEventListener("input", () => {
  game.isBodyDamage = document.getElementById("body-damage").checked
  localSettings.isBodyDamage = game.isBodyDamage
  localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
});

// difficulty-select-custom event listener is set in build.makeGrid
document.getElementById("difficulty-select").addEventListener("input", () => {
  game.difficultyMode = Number(document.getElementById("difficulty-select").value)
  localSettings.difficultyMode = game.difficultyMode
  localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
});

//main loop ************************************************************
//**********************************************************************
game.loop = game.normalLoop;

function cycle() {
  if (!game.paused) requestAnimationFrame(cycle);
  const now = Date.now();
  const elapsed = now - game.then; // calc elapsed time since last loop
  if (elapsed > game.fpsInterval) { // if enough time has elapsed, draw the next frame
    game.then = now - (elapsed % game.fpsInterval); // Get ready for next frame by setting then=now.   Also, adjust for fpsInterval not being multiple of 16.67

    game.cycle++; //tracks game cycles
    mech.cycle++; //tracks player cycles  //used to alow time to stop for everything, but the player
    if (game.clearNow) {
      game.clearNow = false;
      game.clearMap();
      level.start();
    }

    game.loop();
    // for (let i = 0, len = loop.length; i < len; i++) {
    //   loop[i]()
    // }
  }
}