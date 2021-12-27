// Global vars-------------------------------------------------------
var w;
var h;
var a, b; //width and height depending on device orientation
var mobile;
var zoom;
var page1, page0, active_page;
var b_fs_yes;
var position;
var text_on;
//common parameters for drawings:
var radius, c1, c2, bi, p_min, p_max;
var drawing, selected;
var seed_row, seed_column; //number of rows and columns in the seed page (page1)
var step, horizon;

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
  for (bt = 0; bt < this.button.length; bt++) {
    this.button[bt].draw();
  }
};

Menu.prototype.checkButtons = function (x, y) {
  for (bt = 0; bt < this.button.length; bt++) {
    if (this.button[bt].is_pressed(x, y)) {
      this.button[bt].action();
      return bt;
    }
  }
  return null;
};

// Page class -----------------------------------------------------------------
function Page() {
  this.menu; //Menu for this page
  this.active; //is it a currently active page? boolean
  this.clear; //if "true" draw() will clear the page contents: background, stroke, fill...
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
  this.strokeweight = 1;
  this.stroke = [72, 142, 153, 100];
  this.fill = false;
  this.position; // x,y vector
  this.counter;
  this.live; // true if still being drawn, false if done
  //project specific
  this.radius = 50;
  this.c1 = 0.5;
  this.c2 = 1 + (1 - this.c1) / 1.618033988749;
  this.angle = []; // array of 3 angles
  this.phase = []; // array of 3 phases
  this.stop_angle; //upper limit in draw()
  this.bx1; // bezier ancors
  this.by1;
  this.bx2;
  this.by2;
  this.bx3;
  this.by3;
  this.bx4;
  this.by4;
}

Drawing.prototype.reset = function () {
  //generic
  this.counter = 1;
  this.live = true;
  //project specific
  this.angle = [-180, -180, -180];
  this.phase[0] = round(random(p_min, round(random(p_min, p_max))) * 10) / 10;
  this.phase[1] = round(random(p_min, round(random(p_min, p_max))) * 10) / 10;
  this.phase[2] = round(random(p_min, round(random(p_min, p_max))) * 10) / 10;
  this.stop_angle = 180;
  this.bx1 = round(random(-bi, bi));
  this.by1 = round(random(-bi, bi));
  this.bx2 = round(random(-bi, bi));
  this.by2 = round(random(-bi, bi));
  this.bx3 = round(random(-bi, bi));
  this.by3 = round(random(-bi, bi));
  this.bx4 = round(random(-bi, bi));
  this.by4 = round(random(-bi, bi));
};

Drawing.prototype.reset_soft = function () {
  //preserve phase[] and bezier values
  //generic
  this.counter = 1;
  this.live = true;
  //project specific
  this.angle = [-180, -180, -180];
};

Drawing.prototype.copy = function (source) {
  this.phase = [source.phase[0], source.phase[1], source.phase[2]];
  this.stop_angle = source.stop_angle;
  this.bx1 = source.bx1 * (this.radius / source.radius);
  this.by1 = source.by1 * (this.radius / source.radius);
  this.bx2 = source.bx2 * (this.radius / source.radius);
  this.by2 = source.by2 * (this.radius / source.radius);
  this.bx3 = source.bx3 * (this.radius / source.radius);
  this.by3 = source.by3 * (this.radius / source.radius);
  this.bx4 = source.bx4 * (this.radius / source.radius);
  this.by4 = source.by4 * (this.radius / source.radius);
};

Drawing.prototype.increment = function () {
  if (this.live) {
    if (
      this.counter *
        min(abs(this.phase[0]), abs(this.phase[1]), abs(this.phase[2])) <
        this.stop_angle &&
      this.counter *
        min(abs(this.phase[0]), abs(this.phase[1]), abs(this.phase[2])) >
        step
    ) {
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
  //frameRate(25);

  w = displayWidth;
  h = displayHeight;
  createCanvas(w, h);

  if (deviceOrientation === "landscape") {
    a = w;
    b = h;
  } else {
    a = h;
    b = w;
  }

  text_on = true;

  seed_row = 5;
  seed_column = 7;

  position = [];
  drawing = [];

  bi = 17; //bezier intensity (how far is the achor)
  p_min = 3; //phase lower limit
  p_max = 17; //phase upper limit

  step = 0.5;
  horizon = 2; //number of drawings to be displayed in front (or behind) the selected drawing per dimension axis

  //if (
  //  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  //    navigator.userAgent
  //  )
  //) {
  //  mobile = true;
  //}

  // page0 - enter fullscreen-----------------------------------------------------------------

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

  // page0 - intro page-----------------------------------------------------------------
  menu_p0 = new Menu();
  menu_p0.button = [b_fs_yes];
  page0 = new Page();
  page0.menu = menu_p0;
  page0.clear = true;
  active_page = page0;

  // page1 - seed page-----------------------------------------------------------------
  page1 = new Page();
  page1.clear = true;
  setup_page1();

  // page2 - explore page-----------------------------------------------------------------
  b_reset = new Button(0.9 * a, 0.1 * b, 0.1 * b, "");
  b_reset.draw = function () {
    noStroke();
    fill(147, 162, 155, 100);
    ellipse(this.x, this.y, this.radius);
  };

  b_reset.action = function () {
    setup_page1();
    page1.clear = true;
    active_page = page1;
    redraw();
  };
  menu_p2 = new Menu();
  menu_p2.button = [b_reset];
  page2 = new Page();
  page2.menu = menu_p2;
  page2.clear = true;

  // To save parameters of selected object
  selected = new Drawing();
  selected.reset();
}
function setup_page1() {
  position = [];
  drawing = [];
  var index = 0;
  radius = min(a, b) / ((max(seed_row, seed_column) + 1) * 2);
  for (let i = 0; i < seed_row; i++) {
    for (let j = 0; j < seed_column; j++) {
      position[index] = createVector(
        ceil(((j + 1) * a) / (seed_column + 1)),
        ceil(((i + 1) * b) / (seed_row + 1))
      );
      index++;
    }
  }

  for (let index = 0; index < position.length; index++) {
    drawing[index] = new Drawing();
    drawing[index].radius = radius;
    drawing[index].position = position[index];
    drawing[index].reset();
  }
}
function setup_page2() {
  position = [];
  drawing = [];
  var w1, w2; // split screen verticaly in Golden ratio
  var wa; //axis
  w1 = a / (1 + (1 + sqrt(5)) / 2);
  w2 = a - w1;
  wa = [
    w1 + (1 * w2) / 8,
    w1 + (3 * w2) / 8,
    w1 + (5 * w2) / 8,
    w1 + (7 * w2) / 8,
  ];

  position[0] = createVector(ceil(w1 / 2), ceil(b / 2)); //central element
  var index = 1;
  //vertical axis
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2 * horizon; j++) {
      position[index] = createVector(
        ceil(wa[i]),
        //(j + 1) * ceil(b / (2 * horizon + 2))
        ceil(0.1*b+((2*j +1)*0.8*b)/(4*horizon))
      );
      index++;
    }
  }

  for (let index = 0; index < position.length; index++) {
    drawing[index] = new Drawing();
    if (index == 0) {
      drawing[index].radius = (0.4 * b) / 2;
      drawing[index].strokeweight = 2;
    } else {
      drawing[index].radius = 0.55*(b / (4*horizon));
    }
    drawing[index].position = position[index];
    drawing[index].reset();
  }
}

function draw() {
  //let time = millis();
  switch (active_page) {
    case page0:
      if (active_page.clear) {
        background(17, 24, 19);
        active_page.clear = false;
      }
      active_page.drawMenu();
      break;

    case page1:
    case page2:
      if (active_page.clear) {
        background(17, 24, 19);
        noStroke();
        fill(72, 142, 153);
        if (text_on) {
          for (let index = 0; index < position.length; index++) {
            text(
              "phase0: " + drawing[index].phase[0],
              position[index].x + radius,
              position[index].y + radius - 30
            );
            text(
              "phase1: " + drawing[index].phase[1],
              position[index].x + radius,
              position[index].y + radius - 15
            );
            text(
              "phase2: " + drawing[index].phase[2],
              position[index].x + radius,
              position[index].y + radius
            );
            text(
              "stop_angle: " + drawing[index].stop_angle,
              position[index].x + radius,
              position[index].y + radius +15
            );
          }
        }
        active_page.clear = false;
      }
      active_page.drawMenu();
      noFill();
      //project specific draw
      for (let index = 0; index < position.length; index++) {
        if (drawing[index].live) {
          strokeWeight(drawing[index].strokeweight);
          stroke(
            drawing[index].stroke[0],
            drawing[index].stroke[1],
            drawing[index].stroke[2],
            drawing[index].stroke[3]
          );
          if (drawing[index].fill) {
            fill(
              drawing[index].stroke[0],
              drawing[index].stroke[1],
              drawing[index].stroke[2],
              drawing[index].stroke[3]
            );
          }
          push();
          translate(drawing[index].position.x, drawing[index].position.y);
          var x1, y1, x2, y2;
          var x3, y3, x4, y4;
          var bx1, by1, bx2, by2, bx3, by3, bx4, by4;
          x1 =
            drawing[index].c1 *
            drawing[index].radius *
            sin(drawing[index].angle[0]);
          y1 =
            drawing[index].c1 *
            drawing[index].radius *
            cos(drawing[index].angle[0]);
          x2 = drawing[index].radius * sin(drawing[index].angle[1]);
          y2 = drawing[index].radius * cos(drawing[index].angle[1]);
          x3 = drawing[index].radius * sin(drawing[index].angle[1]);
          y3 = drawing[index].radius * cos(drawing[index].angle[1]);
          x4 =
            drawing[index].c2 *
            drawing[index].radius *
            sin(drawing[index].angle[2]);
          y4 =
            drawing[index].c2 *
            drawing[index].radius *
            cos(drawing[index].angle[2]);
          bx1 = drawing[index].bx1 * sin(drawing[index].angle[0]);
          by1 = drawing[index].by1 * cos(drawing[index].angle[0]);
          bx2 = drawing[index].bx2 * sin(drawing[index].angle[1]);
          by2 = drawing[index].by2 * cos(drawing[index].angle[1]);
          bx3 = drawing[index].bx3 * sin(drawing[index].angle[1]);
          by3 = drawing[index].by3 * cos(drawing[index].angle[1]);
          bx4 = drawing[index].bx4 * sin(drawing[index].angle[2]);
          by4 = drawing[index].by4 * cos(drawing[index].angle[2]);

          bezier(x1, y1, x1 + bx1, y1 + by1, x2 + bx2, y2 + by2, x2, y2);
          bezier(x3, y3, x3 + bx3, y3 + by3, x4 + bx4, y4 + by4, x4, y4);
          pop();
          drawing[index].increment();
        }
      }
      break;

    default:
      break;
  }
}

function mouseReleased() {
  if (
    !active_page.menu ||
    active_page.menu.checkButtons(mouseX, mouseY) === null
  ) {
    var s = find_selected();
    selected.copy(drawing[s]);
    if (active_page == page1) {
      active_page = page2;
      setup_page2();
    }
    if (active_page == page2) {
      drawing[0].copy(selected);
      drawing[0].reset_soft();
      var index = 1;
      for (let i = 0; i < 4; i++) {
        //for each of 4 axis
        for (let j = 0; j < 2 * horizon; j++) {
          drawing[index].copy(selected);
          drawing[index].reset_soft();
          if (j < horizon) {
            //positive side of axis...
            if (i != 0) {
              //for phase[] dimensions (first three axis)
              drawing[index].phase[i - 1] += (horizon - j) * step;
            } else {
              drawing[index].stop_angle += (horizon - j) * step * 100;
            }
          } else {
            //negative side of axis...
            if (i != 0) {
              //for phase[] dimensions (first three axis)
              drawing[index].phase[i - 1] += (horizon - j - 1) * step;
            } else {
              drawing[index].stop_angle += (horizon - j - 1) * step * 100;
            }
          }
          index++;
        }
      }
    }
    active_page.clear = true;
    return false;
  }
}

function find_selected() {
  var d = dist(mouseX, mouseY, position[0].x, position[0].y);
  var d0;
  var sel = 0;
  for (k = 1; k < position.length; k++) {
    //console.log("k = " + k);
    d0 = dist(mouseX, mouseY, position[k].x, position[k].y);
    //console.log("d0=" + d0 + "  d=" + d);
    if (d0 < d) {
      d = d0;
      sel = k;
    }
  }
  return sel;
}
//
