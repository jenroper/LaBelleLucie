/* Disclaimer:  I did not originally write this, but I did modify some of it.
* I obtained this code from the following website:
* http://lab.aerotwist.com/canvas/fireworks/
*
* Copyright and license info below.
*/

/**
 * Copyright (C) 2011 by Paul Lewis for CreativeJS. We love you all :)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */



// fireworks have particles
var Particle = function(pos, target, vel, marker, usePhysics) {
  // properties needed for aninmation and coloring
  this.GRAVITY = 0.06;
  this.alpha = 1;
  this.easing = Math.random() * 0.02;
  this.fade = Math.random() * 0.1;
  this.gridX = marker % 120;
  this.gridY = Math.floor(marker / 120) * 12;
  this.color = marker;

  // position of particle
  this.pos = {
    x: pos.x || 0,
    y: pox.y || 0
  };

  // velocity of particle
  this.vel = {
    x: vel.x || 0,
    y: vel.y || 0
  };

  this.target = {
    y: target.y || 0
  };

  this.usePhysics = usePhysics || false;
}

var Fireworks = (function() {
  // set up variables
  particles = []
  mainCanvas = null;
  mainContext = null;
  fireworkCanvas = null;
  fireworkContext = null;
  viewportWidth = 0;
  viewportHeight = 0;

  // Create DOM elements
  function init() {
    // measure the viewport
    onWindowResize();

    // create a main canvas for the fireworks
    mainCanvas = document.createElement("canvas");
    mainContext = mainCanvas.getContext("2d");

    // create a buffering canvas offscreen
    fireworkCanvas = document.createElement("canvas");
    fireworkContext = fireworkCanvas.getContext("2d");

    // set up fireworks colors - Imma change this
    createFireworkPalette(12);

    // set the dimensions on the canvas.
    setMainCanvasDimensions();

    // add the canvas to the document
    document.body.appendChild(mainCanvas);
    document.addEventListener("mouseup", createFirework, true);
    document.addEventListener("touchend", createFirework, true);
    createFirework();

    // and set off
    update();
  }

  /**
   * Pass through function to create a
   * new firework on touch / click
   */
  function createFirework() {
    createParticle();
  }

  /**
   * Update the canvas based on the
   * detected viewport size
   */
  function setMainCanvasDimensions() {
    mainCanvas.width = viewportWidth;
    mainCanvas.height = viewportHeight;
  }

  // main loop
  function update() {
    clearContext();
    requestAnimFrame(update);
    drawFireworks();
  }

  // clear the canvas with a semi transparent black
  // this sets up a trails effect
  function clearContext() {
    mainContext.fillStyle = "rgba(0,0,0,0.2)";
    mainContext.fillRect(0, 0, viewportWidth, viewportHeight);
  }

  // draw fireworks by passing over all active particles
  // and drawing them.
  function drawFireworks() {
    var a = particles.length;

    while (a--) {
      var firework = particles[a];

      // if update returns true, then we should explode the firework.
      if (firework.update()) {
        // kill the firework and replace with particles
        // for the exploded version
        particles.splice(a, 1);

        // if the firework isn't using physics
        // then we can safely explode it...yeah
        if (!firework.usePhysics) {
          if (Math.random() < 0.8) {
            FireworkExplosions.star(firework);
          } else {
            FireworkExplosions.circle(firework);
          }
        }
      }

      // pass the canvas context and firework colors to the main canvas
      firework.render(mainContext, fireworkCanvas);
    }
  }

  // create a block of colors for the fireworks to use
  function createFireworkPalette(gridSize) {
    var size = gridSize * 10;
    fireworkCanvas.width = size;
    fireworkCanvas.height = size;
    fireworkContext.globalCompositeOperation = "source-over";

    // create 100 blocks that cycle through the rainbow
    for (var c = 0; c < 100; c++) {
      var marker = (c * gridSize);
      var gridX = marker % size;
      var gridY = Math.floor(marker / size) * gridSize;

      fireworkContext.fillStyle = "hsl(" + Math.round(c * 3.6) + ", 100%, 60%)";
      fireworkContext.fillRect(gridX, gridY, gridSize, gridSize);
      //var mybigGlow = Library.bigGlow;
      var mybigGlow = document.getElementById("big-glow");
      //console.log(mybigGlow);
      fireworkContext.drawImage(mybigGlow, gridX, gridY);
    }
  }

  // create a new particle
  function createParticle(pos, target, vel, color, usePhysics) {
    pos = pos || {};
    target = target || {};
    vel = vel || {};

    particles.push(
      new Particle(
        // position
        {
          x: pos.x || viewportWidth * 0.5,
          y: pos.y || viewportHeight + 10
        },
        // target
        {
          y: target.y || 150 + Math.random() * 100
        },
        // velocity
        {
          x: vel.x || Math.random() * 3 - 1.5,
          y: vel.y || 0
        },
        color || Math.floor(Math.random() * 100) * 12,
        usePhysics)
    );
  }

  /**
  * Callback for window resizing -
  * sets the viewport dimensions
  */
 function onWindowResize() {
   viewportWidth = window.innerWidth;
   viewportHeight = window.innerHeight;
 }

 // declare an API
 return {
   initialize: init,
   createParticle: createParticle
 };
})();

// code for requesting animation frames that handles
// support in multiple browsers.
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


/**
 * Represents a single point, so the firework being fired up
 * into the air, or a point in the exploded firework
 */
var Particle = function(pos, target, vel, marker, usePhysics) {

  // properties for animation
  // and colouring
  this.GRAVITY  = 0.06;
  this.alpha    = 1;
  this.easing   = Math.random() * 0.02;
  this.fade     = Math.random() * 0.1;
  this.gridX    = marker % 120;
  this.gridY    = Math.floor(marker / 120) * 12;
  this.color    = marker;

  this.pos = {
    x: pos.x || 0,
    y: pos.y || 0
  };

  this.vel = {
    x: vel.x || 0,
    y: vel.y || 0
  };

  this.lastPos = {
    x: this.pos.x,
    y: this.pos.y
  };

  this.target = {
    y: target.y || 0
  };

  this.usePhysics = usePhysics || false;

};

/**
 * Functions that we'd rather like to be
 * available to all our particles, such
 * as updating and rendering
 */
Particle.prototype = {

  update: function() {

    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;

    if(this.usePhysics) {
      this.vel.y += this.GRAVITY;
      this.pos.y += this.vel.y;

      // since this value will drop below
      // zero we'll occasionally see flicker,
      // ... just like in real life! Woo! xD
      this.alpha -= this.fade;
    } else {

      var distance = (this.target.y - this.pos.y);

      // ease the position
      this.pos.y += distance * (0.03 + this.easing);

      // cap to 1
      this.alpha = Math.min(distance * distance * 0.00005, 1);
    }

    this.pos.x += this.vel.x;

    return (this.alpha < 0.005);
  },

  render: function(context, fireworkCanvas) {

    var x = Math.round(this.pos.x),
        y = Math.round(this.pos.y),
        xVel = (x - this.lastPos.x) * -5,
        yVel = (y - this.lastPos.y) * -5;

    context.save();
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = Math.random() * this.alpha;

    // draw the line from where we were to where
    // we are now
    context.fillStyle = "rgba(255,255,255,0.3)";
    context.beginPath();
    context.moveTo(this.pos.x, this.pos.y);
    context.lineTo(this.pos.x + 1.5, this.pos.y);
    context.lineTo(this.pos.x + xVel, this.pos.y + yVel);
    context.lineTo(this.pos.x - 1.5, this.pos.y);
    context.closePath();
    context.fill();

    // draw in the images
    context.drawImage(fireworkCanvas,
      this.gridX, this.gridY, 12, 12,
      x - 6, y - 6, 12, 12);
    var mysmallGlow = document.getElementById("small-glow");
    context.drawImage(mysmallGlow, x - 3, y - 3);

    context.restore();
  }

};


// Store references to images that we want later on
var Library = {
  bigGlow: document.getElementById("big-glow"),
  smallGlow: document.getElementById("small-glow")
};

var FireworkExplosions = {
  // explode in a circular fashion
  circle: function(firework) {
    var count = 100;
    var angle = (Math.PI * 2) / count;
    while (count--) {
      var randomVelocity = 4 + Math.random() * 4;
      var particleAngle = count * angle;

      Fireworks.createParticle(
        firework.pos,
        null,
        {
          x: Math.cos(particleAngle) * randomVelocity,
          y: Math.sin(particleAngle) * randomVelocity
        },
        firework.color,
        true);
    }
  },

  /**
   * Explodes in a star shape
   */
  star: function(firework) {

    // set up how many points the firework
    // should have as well as the velocity
    // of the exploded particles etc
    var points          = 6 + Math.round(Math.random() * 15);
    var jump            = 3 + Math.round(Math.random() * 7);
    var subdivisions    = 10;
    var radius          = 80;
    var randomVelocity  = -(Math.random() * 3 - 6);

    var start           = 0;
    var end             = 0;
    var circle          = Math.PI * 2;
    var adjustment      = Math.random() * circle;

    do {

      // work out the start, end
      // and change values
      start = end;
      end = (end + jump) % points;

      var sAngle = (start / points) * circle - adjustment;
      var eAngle = ((start + jump) / points) * circle - adjustment;

      var startPos = {
        x: firework.pos.x + Math.cos(sAngle) * radius,
        y: firework.pos.y + Math.sin(sAngle) * radius
      };

      var endPos = {
        x: firework.pos.x + Math.cos(eAngle) * radius,
        y: firework.pos.y + Math.sin(eAngle) * radius
      };

      var diffPos = {
        x: endPos.x - startPos.x,
        y: endPos.y - startPos.y,
        a: eAngle - sAngle
      };

      // now linearly interpolate across
      // the subdivisions to get to a final
      // set of particles
      for(var s = 0; s < subdivisions; s++) {

        var sub = s / subdivisions;
        var subAngle = sAngle + (sub * diffPos.a);

        Fireworks.createParticle(
          {
            x: startPos.x + (sub * diffPos.x),
            y: startPos.y + (sub * diffPos.y)
          },
          null,
          {
            x: Math.cos(subAngle) * randomVelocity,
            y: Math.sin(subAngle) * randomVelocity
          },
          firework.color,
          true);
      }

    // loop until we're back at the start
    } while(end !== 0);

  }
}

// Go
window.onload = function() {
  Fireworks.initialize();
};

function newGame(event) {
  window.history.back();
}
