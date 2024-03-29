const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");
let reticle = document.getElementById("reticle");
let parms = document.getElementById('form');
const sfx = document.getElementById("popping");
const videoCheck=document.getElementById("hasVideo");
const reticleCheck=document.getElementById("hasReticle");
const inputXBias = document.getElementById("xBias")
const inputYBias = document.getElementById("yBias")

const soundEffect = new Audio();

let isVideo = false;
let model = null;



//// Balloon Portion

const bodyMain = document.getElementById("bodyMain");
//console.log(bodyMain);
// const balloonTest = document.createElement("div");
// balloonTest.setAttribute('class','balloon');
// bodyMain.appendChild(balloonTest);

const balloons = [];
const numBalloons = 8;
const numColumns = 5;
const basement = 1300;
const scalar = 1.33;
let biasX=50;
let  biasY=0;
var isPointing = false;


var reticleX = 0;
var reticleY = 0;


//console.log(parms)
//// Form
parms.addEventListener('submit',e=>{
    e.preventDefault();
    
    //biasX = parseInt(inputXBias.value) || parseInt(inputXBias.placeHolder)
    if(parseInt(inputXBias.value)){
        biasX=parseInt(inputXBias.value);
    }else{
        biasX=parseInt(inputXBias.placeholder);
    }

    if(parseInt(inputYBias.value)){
        biasY=parseInt(inputYBias.value);
    }else{
        biasY=parseInt(inputYBias.placeholder);
    }
    console.log(parseInt(biasY))
    

    // Update CSS Parameters
    if(videoCheck.checked){
        canvas.style.visibility='visible';
    }
    else{
        canvas.style.visibility='hidden';
    }
    if(reticleCheck.checked){
        reticle.style.visibility='visible';
    }
    else{
        reticle.style.visibility='hidden';
    }
    

})



function loadBalloons(){
    for (let i = 0;i < numBalloons; i++){
        balloons[i] = document.createElement("div");
        balloons[i].setAttribute('class','balloon');
        balloons[i].style.top = `${basement-(i * 150)}`+'px';
        bodyMain.appendChild(balloons[i]);
        let rand = Math.floor(Math.random() * numColumns);
        balloons[i].style.left = `${(rand * 100)+400}`+'px';
        balloons[i].isPopped=false;

        if (rand === 1) 
            balloons[i].style.background = "url('./balloon_yellow.png')";
        if (rand === 2) 
            balloons[i].style.background = "url('./balloon_green.png')";
        if (rand === 3) 
            balloons[i].style.background = "url('./balloon_red.png')";
        
        //balloons[i].style.visibility='hidden';
    }
}

loadBalloons();

function resetBalloon(balloon){
    balloon.classList.remove("pop")
    balloon.classList.remove("pop-background")
    //console.log(balloon)
    let rand = Math.floor(Math.random() * numColumns);
    balloon.style.top=`${basement}`+'px';
    balloon.style.visibility='visible';
    rand = Math.floor(Math.random() * numColumns);
    if (rand === 1) 
    balloon.style.background = "url('./balloon_yellow.png')";
    if (rand === 2) 
    balloon.style.background = "url('./balloon_green.png')";
    if (rand === 3) 
    balloon.style.background = "url('./balloon_red.png')";

    balloon.style.left = `${(rand * 100)+400}`+'px';
}

function popBalloon(balloon){
    balloon.style.background = "url('./balloon_pop_sprite2.png')";
    //balloon.classList.add('pop-background')
    balloon.classList.add('pop')
    // const sfx = document.createElement("audio");
    // sfx.setAttribute("src","popping.m4a");
    // sfx.setAttribute("type","x-m4a");
    if (balloon.isPopped!==true){
        soundEffect.play();
        balloon.isPopped=true;
        console.log(balloon.isPopped);
    
    }
    setTimeout(()=>{balloon.style.visibility='hidden';
                    balloon.isPopped=false;
                },200)

}


function moveBalloons(){

    for (let i = 0;i < numBalloons; i++){
        let top = parseInt(window.getComputedStyle(balloons[i]).getPropertyValue("top"))  ;
        let left = parseInt(window.getComputedStyle(balloons[i]).getPropertyValue("left"))  ;

        if (top<100){   //recycle balloon
            
            let rand = Math.floor(Math.random() * numColumns);
            balloons[i].style.top=`${basement}`+'px';
            balloons[i].style.left = `${(rand * 100)+400}`+'px';
            balloons[i].style.visibility='visible';
            if (rand === 4) 
                balloons[i].style.background = "url('./balloon_cyan.png')";
            if (rand === 0) 
                balloons[i].style.background = "url('./balloon_cyan.png')";
            if (rand === 1) 
                balloons[i].style.background = "url('./balloon_yellow.png')";
            if (rand === 2) 
                balloons[i].style.background = "url('./balloon_green.png')";
            if (rand === 3) 
                balloons[i].style.background = "url('./balloon_red.png')";
         }
        else{
            balloons[i].style.top=`${ top-4 }`+'px';

            //Collision detection
            if (reticleX>=left && reticleX <=left+100 && reticleY>= top && reticleY<=top+150){
                 popBalloon(balloons[i]);
            }
        }
    }
}



//Handtrack

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.3,    // confidence threshold for predictions. was .06
    imageScaleFactor: 2.0,
    modelSize: "medium",

}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking";
            isVideo = true;
            runDetection();
            setInterval(moveBalloons,10);                    //Timer for Balloons
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    // const soundEffect = new Audio();
    soundEffect.autoplay = true;
    soundEffect.src="./popping.mp3"
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}



function runDetection() {
    model.detect(video).then(predictions => {
     // console.log("Predictions: ", predictions);

        /////  SHOULD BE A FUNCTION

        // bounding box uses left, top, right, bottom

        if (predictions[1] && (predictions[1].label === 'point')){

            reticle.style.backgroundColor='lightgreen';
            isPointing =true;

            reticleX = parseInt(window.getComputedStyle(reticle).getPropertyValue("left")) + 5  ;
            reticleY = parseInt(window.getComputedStyle(reticle).getPropertyValue("top")) + 5 ;


        }
        else if(predictions[1] && (predictions[1].label === 'closed') && isPointing){
            reticle.style.backgroundColor='red';
            isPointing = false;
            reticleX=0;
            reticleY=0;


        }
        else{
            reticle.style.backgroundColor='black';
            isPointing = false;
            reticleX=0;
            reticleY=0;

        }


        if(predictions[1]){
            //console.log(predictions[0].bbox);
           // console.log(predictions[1].bbox[2]-predictions[1].bbox[0])
            reticle.style.left=`${(predictions[1].bbox[0]+biasX)*scalar}`+'px';
            //reticle.style.left=`${((predictions[1].bbox[0])*scalar)+predictions[1].bbox[3]-predictions[1].bbox[0]}`+'px';
            //reticle.style.left=`${((predictions[1].bbox[3]-predictions[1].bbox[0])+predictions[1].bbox[0])*scalar}`+'px';
            reticle.style.top=`${((predictions[1].bbox[1]+biasY)*scalar)+100}`+'px';
        }

         ///// 

        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    console.log(lmodel);
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});


