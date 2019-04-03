// import * as posenet from '@tensorflow-models/posenet';

// let parameters = {
// }


// function initialize() {


// }

// function onWindowResize() {

// }

// function animate() {
    
//     requestAnimationFrame( animate )

// }


// function render() {

// }

// let main = ()=> {


//     initialize()


//     window.addEventListener("resize", onWindowResize, false )

    
//     animate()
// }

// document.addEventListener("DOMContentLoaded", main)

const craneMoveSpeed = 500
let dropBoxMinSpeed = 5000
let dropBoxSpeed = 5000
let dropBoxMaxSpeed = 1000
let updateBoxesSpeed = 500
let updatePlayerSpeed = 500
let columnMarginX = 7
let heartMarginX = 5
const craneOffsetX = 20
const craneOffsetY = 20
let nInitialLives = 3
let columnHeight = null

let playerOffsetY = 10

let playerMinMoveDistance = 20
let playerImageIndex = 0
let playerImageLeftOffset = 0
let playerImageRightOffset = 0
let playerImageFrontOffset = 0
let playerDirection = 'front'
let playerCatchBoxLeftIndex = 0
let playerCatchBoxRightIndex = 0

let score = 0
let lives = 3

let boxRaster = null
let boxDefinition = null
let boxGroup = null
let crane = null
let craneBox = null
let craneGroup = null
let heart0 = null
let heart1 = null
let heartGroup = null
let heartGroups = null
let playerImages = []
let playerGroup = null
let playerRectangle = null
let startScreen = null
let scoreText = null
let highScoreText = null

let craneTween = null
let dropBoxLastTime = null
let updateBoxesLastTime = null

let updatePlayerLastTime = null

let gameStarted = false

function preInitializeGameNWatch() {

  let canvas = document.getElementById('game-n-watch')
  paper.setup(canvas)

  // Create background
  let background = new paper.Raster('data/background.jpg')
  background.position = paper.view.bounds.center
  background.smoothing = false

  background.onLoad = ()=> {
    paper.view.scaling.x = paper.view.bounds.width / background.bounds.width
    paper.view.scaling.y = paper.view.bounds.height / background.bounds.height

    initializeGameNWatch()
  }

}

function initializeGameNWatch() {


  startScreen = new paper.Raster('data/startScreen.png')
  startScreen.onLoad = ()=> {
    startScreen.position = paper.view.bounds.center
  }
  startScreen.smoothing = false

  boxRaster = new paper.Raster('data/box.png')
  boxRaster.smoothing = false
  boxDefinition = new paper.SymbolDefinition(boxRaster)
  boxGroup = new paper.Group()

  crane = new paper.Raster('data/crane.png')
  crane.smoothing = false
  craneBox = new paper.Raster('data/craneBox.png')
  craneBox.smoothing = false
  craneGroup = new paper.Group()

  craneGroup.addChild(crane)
  craneGroup.addChild(craneBox)
  
  crane.onLoad = ()=> {
    craneGroup.position.x = paper.view.bounds.left + craneOffsetX
    craneGroup.position.y = paper.view.bounds.top + craneOffsetY
  }

  crane.visible = false

  heart0 = new paper.Raster('data/heart0.png')
  heart1 = new paper.Raster('data/heart1.png')
  heart0.smoothing = false
  heart1.smoothing = false
  heartGroup = new paper.Group()
  heartGroup.addChild(heart0)
  heartGroup.addChild(heart1)
  heartGroups = new paper.Group()
  
  heart0.onLoad = ()=> {
    heartGroup.position.x = paper.view.bounds.center.x - heart0.bounds.width - heartMarginX
    heartGroup.position.y = paper.view.bounds.bottom - heart0.bounds.height / 2
    heartGroups.addChild(heartGroup)
    heartGroups.addChild(heartGroup.clone())
    heartGroups.lastChild.position.x += heart0.bounds.width + heartMarginX
    heartGroups.addChild(heartGroup.clone())
    heartGroups.lastChild.position.x += 2 * (heart0.bounds.width + heartMarginX)

    createScoreTexts()
  }

  playerImages.push(new paper.Raster('data/player0left.png'))
  playerImages.push(new paper.Raster('data/player1left.png'))
  playerImages.push(new paper.Raster('data/player2left.png'))
  playerImages.push(new paper.Raster('data/player3left.png'))
  playerImages.push(new paper.Raster('data/player4left.png'))
  playerImages.push(new paper.Raster('data/player0right.png'))
  playerImages.push(new paper.Raster('data/player1right.png'))
  playerImages.push(new paper.Raster('data/player2right.png'))
  playerImages.push(new paper.Raster('data/player3right.png'))
  playerImages.push(new paper.Raster('data/player4right.png'))
  playerImages.push(new paper.Raster('data/player0front.png'))
  playerImages.push(new paper.Raster('data/player1front.png'))

  playerImageLeftOffset = 0
  playerImageRightOffset = 5
  playerImageFrontOffset = 10
  playerCatchBoxLeftIndex = 4
  playerCatchBoxRightIndex = 9

  // playerImageIndices.left.push(0, 1, 2, 3)
  // playerImageIndices.right.push(5, 6, 7, 8)
  // playerImageIndices.boxLeft.push(4)
  // playerImageIndices.boxRight.push(9)
  // playerImageIndices.front.push(10, 11)

  playerGroup = new paper.Group()

  for(let playerImage of playerImages) {
    playerImage.smoothing = false
    playerImage.visible = false
    playerGroup.addChild(playerImage)
  }

  playerGroup.firstChild.visible = true

  playerImages[0].onLoad = ()=> {
    playerRectangle = new paper.Path.Rectangle(playerGroup.bounds)
    playerRectangle.strokeColor = 'green'
    playerRectangle.strokeWidth = 2
    playerGroup.position.x = paper.view.bounds.center.x
    playerGroup.position.y = paper.view.bounds.bottom - playerGroup.bounds.height / 2 - playerOffsetY
    playerRectangle.position.x = playerGroup.position.x
    playerRectangle.position.y = playerGroup.position.y
    columnHeight = paper.view.bounds.bottom - playerGroup.bounds.height
  }

  // craneTween = new TWEEN.Tween(craneGroup.position)
  // craneTween = createjs.Tween.get(craneGroup.position)

  startBlinkStartScreen()

}

function threeDigitScore(score) {
  if(score < 10) {
    return '00' + Math.round(score)
  } else if(score < 100) {
    return '0' + Math.round(score)
  }
  return '' + score
}

function createScoreTexts() {
  let margin = 5 * heartMarginX

  scoreText = new paper.PointText()
  scoreText.content = 'SCORE  000'
  scoreText.fontFamily = 'DIGI'
  scoreText.fontWeight = 'lighter'
  scoreText.fontSize = 20
  scoreText.bounds.left = paper.view.bounds.left + margin
  scoreText.position.y = paper.view.bounds.bottom - heart0.bounds.width - 2 * heartMarginX

  let highScore = localStorage.getItem('high-score') || 0
  highScoreText = new paper.PointText()
  highScoreText.content = 'HIGH  ' + threeDigitScore(highScore)
  highScoreText.fontFamily = 'DIGI'
  highScoreText.fontWeight = 'lighter'
  highScoreText.fontSize = 20
  highScoreText.bounds.right = paper.view.bounds.right - margin
  highScoreText.position.y = paper.view.bounds.bottom - heart0.bounds.width - 2 * heartMarginX
}

function updateGameNWatch() {
  if(!boxRaster.loaded || !heart0.loaded || !playerImages[0].loaded || !crane.loaded || !craneBox.loaded) {
    return
  }

  let now = Date.now()
  
  if(now > dropBoxLastTime + dropBoxSpeed) {
    dropBoxLastTime = now
    dropBox()
  }

  if(now > updateBoxesLastTime + updateBoxesSpeed) {
    updateBoxesLastTime = now
    updateBoxes()
  }

}

function dropBox() {
  let columnIndex = Math.floor(Math.random() * 10)
  console.log("columnIndex: " + columnIndex)
  let nMargins = Math.floor(columnIndex / 2) * 2 + 1
  console.log("nMargins: " + nMargins)
  let x = paper.view.bounds.left + (columnIndex + 0.5) * boxRaster.bounds.width + nMargins * columnMarginX

  craneBox.visible = true
  crane.visible = false

  new Between(craneGroup.position.x, x)
    .time(craneMoveSpeed)
    .easing(Between.Easing.Cubic.InOut)
    .on('update', (value) => {
      craneGroup.position.x = value
    }).on('complete', (value) => {
      crane.visible = true
      craneBox.visible = false

      let box = new paper.SymbolItem(boxDefinition)
      box.position.x = x
      box.position.y = paper.view.bounds.top + craneBox.bounds.height - boxRaster.bounds.height / 2
      boxGroup.addChild(box)

      new Between(craneGroup.position.x, paper.view.bounds.left + craneOffsetX)
        .time(craneMoveSpeed)
        .easing(Between.Easing.Cubic.InOut)
        .on('update', (value) => {
          craneGroup.position.x = value
        })
    })

  // craneTween.to({x: x}, craneMoveSpeed).call(()=> {

  //   crane.visible = true
  //   craneBox.visible = false

  //   let box = new paper.SymbolItem(boxDefinition)
  //   box.position.x = x
  //   box.position.y = paper.view.bounds.top + craneBox.bounds.height - boxRaster.bounds.height / 2
  //   boxGroup.addChild(box)

    
  // })
  //.wait(200).to({x: paper.view.bounds.left + craneOffsetX}, craneMoveSpeed)
}

function updateBoxes() {

  for(let box of boxGroup.children.slice()) {

    box.position.y += boxRaster.bounds.height

    if (gameStarted && box.position.y > columnHeight + boxRaster.bounds.height) {

      lives--

      if(lives >= 0) {

        heartGroups.children[lives].lastChild.visible = false

      } else {

        gameStarted = false

        for(let box of boxGroup.children.slice()) {
          box.remove()
        }

        for(let heart of heartGroups.children) {
          heart.lastChild.visible = true
        }

        let highScore = localStorage.getItem('high-score') || 0
        
        if(score > highScore) {
          highScoreText.content = 'HIGH  ' + threeDigitScore(score)
          localStorage.setItem('high-score', score)
        }
        
        score = 0
        scoreText.content = 'SCORE  ' + threeDigitScore(score)

        dropBoxSpeed = dropBoxMinSpeed

        startBlinkStartScreen()
      }

      box.remove()
    }


  }
}

function catchBoxes() {

  for(let box of boxGroup.children.slice()) {

    if(box.position.y > columnHeight && playerRectangle.bounds.intersects(box.bounds)) {

      if(!gameStarted) {
        stopBlinkStartScreen()
        gameStarted = true
      }

      score += 10

      scoreText.content = 'SCORE  ' + threeDigitScore(score)

      for(let child of playerGroup.children) {
        child.visible = false
      }

      let showLeft = playerDirection == 'left' || ( playerDirection == 'front' && Math.random() > 0.5)
      playerGroup.children[showLeft ? playerCatchBoxLeftIndex : playerCatchBoxRightIndex].visible = true

      box.remove()

      dropBoxSpeed -= Math.floor(score / 10) * 50
    
      if(dropBoxSpeed < dropBoxMaxSpeed) {
        dropBoxSpeed = dropBoxMaxSpeed
      }
    }
  }
}

let startScreenSpeedOn = 1000
let startScreenSpeedOff = 250
let startScreenTimeout = null

function startBlinkStartScreen() {
  stopBlinkStartScreen()
  startScreenTimeout = setTimeout(blinkStartScreen, startScreenSpeedOn)
  startScreen.visible = true
}

function blinkStartScreen() {
  startScreen.visible = !startScreen.visible
  startScreenTimeout = setTimeout(blinkStartScreen, startScreen.visible ? startScreenSpeedOn : startScreenSpeedOff)
}

function stopBlinkStartScreen() {
  startScreen.visible = false
  clearTimeout(startScreenTimeout)
}


import {drawBoundingBox, drawKeypoints, drawSkeleton} from './js/demo_util.js';

const videoWidth = 600;
const videoHeight = 500;
const stats = new Stats();

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

const guiState = {
  algorithm: 'multi-pose',
  input: {
    mobileNetArchitecture: isMobile() ? '0.50' : '0.75',
    outputStride: 16,
    imageScaleFactor: 0.5,
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
  },
  multiPoseDetection: {
    maxPoseDetections: 5,
    minPoseConfidence: 0.15,
    minPartConfidence: 0.1,
    nmsRadius: 30.0,
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras, net) {
  guiState.net = net;

  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId;
  }

  const gui = new dat.GUI({width: 300});

  // The single-pose algorithm is faster and simpler but requires only one
  // person to be in the frame or results will be innaccurate. Multi-pose works
  // for more than 1 person
  const algorithmController =
      gui.add(guiState, 'algorithm', ['single-pose', 'multi-pose']);

  // The input parameters have the most effect on accuracy and speed of the
  // network
  let input = gui.addFolder('Input');
  // Architecture: there are a few PoseNet models varying in size and
  // accuracy. 1.01 is the largest, but will be the slowest. 0.50 is the
  // fastest, but least accurate.
  const architectureController = input.add(
      guiState.input, 'mobileNetArchitecture',
      ['1.01', '1.00', '0.75', '0.50']);
  // Output stride:  Internally, this parameter affects the height and width of
  // the layers in the neural network. The lower the value of the output stride
  // the higher the accuracy but slower the speed, the higher the value the
  // faster the speed but lower the accuracy.
  input.add(guiState.input, 'outputStride', [8, 16, 32]);
  // Image scale factor: What to scale the image by before feeding it through
  // the network.
  input.add(guiState.input, 'imageScaleFactor').min(0.2).max(1.0);
  input.open();

  // Pose confidence: the overall confidence in the estimation of a person's
  // pose (i.e. a person detected in a frame)
  // Min part confidence: the confidence that a particular estimated keypoint
  // position is accurate (i.e. the elbow's position)
  let single = gui.addFolder('Single Pose Detection');
  single.add(guiState.singlePoseDetection, 'minPoseConfidence', 0.0, 1.0);
  single.add(guiState.singlePoseDetection, 'minPartConfidence', 0.0, 1.0);

  let multi = gui.addFolder('Multi Pose Detection');
  multi.add(guiState.multiPoseDetection, 'maxPoseDetections')
      .min(1)
      .max(20)
      .step(1);
  multi.add(guiState.multiPoseDetection, 'minPoseConfidence', 0.0, 1.0);
  multi.add(guiState.multiPoseDetection, 'minPartConfidence', 0.0, 1.0);
  // nms Radius: controls the minimum distance between poses that are returned
  // defaults to 20, which is probably fine for most use cases
  multi.add(guiState.multiPoseDetection, 'nmsRadius').min(0.0).max(40.0);
  multi.open();

  let output = gui.addFolder('Output');
  output.add(guiState.output, 'showVideo');
  output.add(guiState.output, 'showSkeleton');
  output.add(guiState.output, 'showPoints');
  output.add(guiState.output, 'showBoundingBox');
  output.open();


  architectureController.onChange(function(architecture) {
    guiState.changeToArchitecture = architecture;
  });

  algorithmController.onChange(function(value) {
    switch (guiState.algorithm) {
      case 'single-pose':
        multi.close();
        single.open();
        break;
      case 'multi-pose':
        single.close();
        multi.open();
        break;
    }
  });
}

/**
 * Sets up a frames per second panel on the top-left of the window
 */
function setupFPS() {
  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
}

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  // since images are being fed from a webcam
  const flipHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    
    updateGameNWatch()

    if (guiState.changeToArchitecture) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();

      // Load the PoseNet model weights for either the 0.50, 0.75, 1.00, or 1.01
      // version
      guiState.net = await posenet.load(+guiState.changeToArchitecture);

      guiState.changeToArchitecture = null;
    }

    // Begin monitoring code for frames per second
    stats.begin();

    // Scale an image down to a certain factor. Too large of an image will slow
    // down the GPU
    const imageScaleFactor = guiState.input.imageScaleFactor;
    const outputStride = +guiState.input.outputStride;

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    switch (guiState.algorithm) {
      case 'single-pose':
        const pose = await guiState.net.estimateSinglePose(
            video, imageScaleFactor, flipHorizontal, outputStride);
        poses.push(pose);

        minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
        break;
      case 'multi-pose':
        poses = await guiState.net.estimateMultiplePoses(
            video, imageScaleFactor, flipHorizontal, outputStride,
            guiState.multiPoseDetection.maxPoseDetections,
            guiState.multiPoseDetection.minPartConfidence,
            guiState.multiPoseDetection.nmsRadius);

        minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
        break;
    }

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (guiState.output.showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      ctx.restore();
    }

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores
    poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
        if (guiState.output.showPoints) {
          drawKeypoints(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showSkeleton) {
          drawSkeleton(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showBoundingBox) {
          drawBoundingBox(keypoints, ctx);
        }
        let nose = keypoints[0]
        
        playerRectangle.position.x = paper.view.bounds.width * nose.position.x / videoWidth
        
        let now = Date.now()
        if(now > updatePlayerLastTime + updatePlayerSpeed) {
           
          let moveDistance = playerRectangle.position.x - playerGroup.position.x
          
          for(let child of playerGroup.children) {
            child.visible = false
          }

          playerImageIndex++

          if(Math.abs(moveDistance) > playerMinMoveDistance) {
            
            if(playerImageIndex > 3) {
              playerImageIndex = 0
            }

            if(moveDistance > 0) {
              playerGroup.children[playerImageIndex + playerImageRightOffset].visible = true
              playerDirection = 'right'
            } else {
              playerGroup.children[playerImageIndex + playerImageLeftOffset].visible = true
              playerDirection = 'left'
            }

          } else {

            if(playerImageIndex > 1) {
              playerImageIndex = 0
            }

            playerGroup.children[playerImageIndex + playerImageFrontOffset].visible = true
            playerDirection = 'front'
          }

          playerGroup.position.x = playerRectangle.position.x
          updatePlayerLastTime = now
        }

        catchBoxes()
      }
    });

    // End monitoring code for frames per second
    stats.end();

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {

  preInitializeGameNWatch()

  // Load the PoseNet model weights with architecture 0.75
  const net = await posenet.load(0.75);

  document.getElementById('loading').style.display = 'none';
  document.getElementById('main').style.display = 'block';

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  setupGui([], net);
  setupFPS();
  detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// kick off the demo
bindPage();