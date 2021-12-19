// Global vars-------------------------------------------------------
var w;
var h;
var mobile;
var zoom;
var page1, page0, active_page;
var b_fs_yes;
var position;
//common parameters for drawings:
var radius, c1, c2;
var drawing;

// Button class -----------------------------------------------------------------
function Button(x, y, r, str) {
  this.pressed = false;
  this.text = str;
  this.active = true;
  this.x = x;
  this.y = y;
  this.radius = r;
  this.draw;
  this.action;
}

Button.prototype.is_pressed = function (x, y) {
  if (dist(this.x, this.y, x, y) < this.radius && this.active == true) {
    this.pressed = true;
    return true;
  } else {
    this.pressed = false;
    return false;
  }
};

// Menu class -----------------------------------------------------------------
function Menu() {
  this.button = [];
}

Menu.prototype.draw = function () {
  for (b = 0; b < this.button.length; b++) {
    this.button[b].draw();
  }
};

Menu.prototype.checkButtons = function (x, y) {
  for (b = 0; b < this.button.length; b++) {
    if (this.button[b].is_pressed(x, y)) {
      this.button[b].action();
      return b;
    }
  }
  return null;
};

// Page class -----------------------------------------------------------------
function Page() {
  this.menu; //Menu for this page
  this.active; //is it a currently active page? boolean
  this.clear; //if "true" draw() will clearadius the page contents: background, stroke, fill...
  this.pageid; //ID of the page
}

Page.prototype.drawMenu = function () {
  if (this.menu) {
    this.menu.draw();
  }
};

// Drawing class-----------------------------------------------------------------------------------------

function Drawing() {
  //generic
  this.position; // x,y vector
  this.counter;
  this.live; // true if still being drawn, false if done
  //project specific
  this.radius;
  this.c1; // radius shift
  this.c2; // radius shift
  this.angle = []; // array of 3 angles
  this.phase = []; // array of 3 phases
}

Drawing.prototype.reset = function () {
  //generic
  this.counter = 0;
  this.live = true;
  //project specific
  this.angle = [-180, -180, -180];
  this.phase[0] = round(random(3, round(random(3, 17))) * 10) / 10;
  this.phase[1] = round(random(3, round(random(3, 17))) * 10) / 10;
  this.phase[2] = round(random(3, round(random(3, 17))) * 10) / 10;
};

Drawing.prototype.increment = function () {
  if (this.live) {
    if (this.counter * min(this.phase[0], this.phase[1], this.phase[2]) < 180) {
      this.angle[0] += this.phase[0];
      this.angle[1] += this.phase[1];
      this.angle[2] += this.phase[2];
      this.counter++;
    } else {
      this.live = false;
    }
  }
};

function setup() {
  frameRate(5);

  w = displayWidth;
  h = displayHeight;
  createCanvas(w, h);

  //noLoop();
  zoom = false;
  position = [];
  drawing = [];

  if (deviceOrientation === "landscape") {
    radius = (0.8 * h) / 8;
    position[0] = createVector(1 * ceil(w / 4), ceil(h / 8 + radius / 2));
    position[1] = createVector(1 * ceil(w / 4), ceil(h / 2));
    position[2] = createVector(1 * ceil(w / 4), ceil((7 * h) / 8 - radius / 2));
    position[3] = createVector(2 * ceil(w / 4), ceil(h / 8 + radius / 2));
    position[4] = createVector(2 * ceil(w / 4), ceil(h / 2));
    position[5] = createVector(2 * ceil(w / 4), ceil((7 * h) / 8 - radius / 2));
    position[6] = createVector(3 * ceil(w / 4), ceil(h / 8 + radius / 2));
    position[7] = createVector(3 * ceil(w / 4), ceil(h / 2));
    position[8] = createVector(3 * ceil(w / 4), ceil((7 * h) / 8 - radius / 2));
  } else {
    //radius = (0.8 * w) / 6;
    //position[0] = createVector(1 * ceil(w / 3), ceil(h / 8 + radius / 2));
    //position[1] = createVector(1 * ceil(w / 3), ceil(h / 2));
    //position[2] = createVector(1 * ceil(w / 3), ceil((7 * h) / 8 - radius / 2));
    //position[3] = createVector(2 * ceil(w / 3), ceil(h / 8 + radius / 2));
    //position[4] = createVector(2 * ceil(w / 3), ceil(h / 2));
    //position[5] = createVector(2 * ceil(w / 3), ceil((7 * h) / 8 - radius / 2));
    radius = (0.5 * w) / 2;
    position[0] = createVector(1 * ceil(w / 2), ceil(h / 5 + radius / 4));
    position[1] = createVector(1 * ceil(w / 2), ceil((3 * h) / 5 + radius / 4));
  }

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    mobile = true;
  }

  // page0 - enteradius fullscreen-----------------------------------------------------------------

  //button
  b_fs_yes = new Button(0.5 * w, 0.5 * h, 0.1 * h, "");

  b_fs_yes.draw = function () {
    noStroke();
    fill(147, 162, 155, 100);
    ellipse(this.x, this.y, this.radius);
  };

  b_fs_yes.action = function () {
    fullscreen(true);
    active_page = page1;
    redraw();
  };

  // page0 menu
  menu_p0 = new Menu();
  menu_p0.button = [b_fs_yes];

  //page0
  page0 = new Page();

  page0.menu = menu_p0;
  page0.clear = true;

  active_page = page0;

  // page1 - main page-----------------------------------------------------------------
  page1 = new Page();
  page1.clear = true;

  for (let index = 0; index < position.length; index++) {
    drawing[index] = new Drawing();
    drawing[index].reset();
    drawing[index].radius = radius;
    drawing[index].position = position[index];
    drawing[index].c1 = 0.5;
    drawing[index].c2 = 1.2;
  }
}

function draw() {
  switch (active_page) {
    case page0:
      if (active_page.clear) {
        background(17, 24, 19);
        active_page.clear = false;
      }
      active_page.drawMenu();
      break;

    case page1:
      if (active_page.clear) {
        background(17, 24, 19);
        strokeWeight(1);
        stroke(72, 142, 153, 100);
        active_page.clear = false;
      }
      active_page.drawMenu();

      //project specific draw
      for (let index = 0; index < position.length; index++) {
        if (drawing[index].live) {
          push();
          translate(drawing[index].position.x, drawing[index].position.y);
          line(
            drawing[index].c1 *
              drawing[index].radius *
              sin(drawing[index].angle[0]),
            drawing[index].c1 *
              drawing[index].radius *
              cos(drawing[index].angle[0]),
            drawing[index].radius * sin(drawing[index].angle[1]),
            drawing[index].radius * cos(drawing[index].angle[1])
          );
          line(
            drawing[index].radius * sin(drawing[index].angle[1]),
            drawing[index].radius * cos(drawing[index].angle[1]),
            drawing[index].c2 *
              drawing[index].radius *
              sin(drawing[index].angle[2]),
            drawing[index].c2 *
              drawing[index].radius *
              cos(drawing[index].angle[2])
          );
          pop();
          drawing[index].increment();
        }
      }
      break;

    default:
      break;
  }
}

//function keyPressed() {
//  //console.log(keyCode);
//  if (keyCode === ENTER) {
//    zoom = false;
//    if (!isLooping()) {
//      loop();
//    }
//    draw();
//  } else if (keyCode === 83) {
//    save("pletenica.jpg");
//  }
//  //  return false;
//}

function mouseReleased() {
  if (!active_page.menu || active_page.menu.checkButtons(mouseX, mouseY) === null) {
    for (let index = 0; index < position.length; index++) {
      drawing[index].reset();
      page1.clear = true;
    }
    return false;
  }
}

//function selected() {
//  var d = dist(mouseX, mouseY, position[0].x, position[0].y);
//  var d0;
//  var sel = 0;
//  for (k = 1; k < 9; k++) {
//    //console.log("k = " + k);
//    d0 = dist(mouseX, mouseY, position[k].x, position[k].y);
//    //console.log("d0=" + d0 + "  d=" + d);
//    if (d0 < d) {
//      d = d0;
//      sel = k;
//    }
//  }
//  return sel;
//}
//