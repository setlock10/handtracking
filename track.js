const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");
let reticle = document.getElementById("reticle")

let isVideo = false;
let model = null;


//// Balloon Portion

const bodyMain = document.getElementById("bodyMain");
console.log(bodyMain);
// const balloonTest = document.createElement("div");
// balloonTest.setAttribute('class','balloon');
// bodyMain.appendChild(balloonTest);

const balloons = [];
const numBalloons = 8;
const numColumns = 5;
const basement = 1300;
const scalar = 1.33;
const biasX=50;
const biasY=0;
var isPointing = false;


var reticleX = 0;
var reticleY = 0;


function loadBalloons(){
    for (let i = 0;i < numBalloons; i++){
        balloons[i] = document.createElement("div");
        balloons[i].setAttribute('class','balloon');
        balloons[i].style.top = `${basement-(i * 150)}`+'px';
        bodyMain.appendChild(balloons[i]);
        let rand = Math.floor(Math.random() * numColumns);
        balloons[i].style.left = `${(rand * 100)+400}`+'px';

        if (rand === 1) 
            balloons[i].style.background = "url('./balloon_yellow.png')";
        if (rand === 2) 
            balloons[i].style.background = "url('./balloon_green.png')";
        if (rand === 3) 
            balloons[i].style.background = "url('./balloon_red.png')";
        

    }
}

loadBalloons();

function resetBalloon(balloon){
    balloon.classList.remove("pop")
    balloon.classList.remove("pop-background")
    //console.log(balloon)
    let rand = Math.floor(Math.random() * numColumns);
    balloon.style.top=`${basement}`+'px';
    balloon.style.left = `${(rand * 100)+400}`+'px';
}

function popBalloon(balloon){
    balloon.style.background = "url('./balloon_pop_sprite2.png')";
    //balloon.classList.add('pop-background')
    balloon.classList.add('pop')
    console.log(balloon);

}


function moveBalloons(){

   // console.log(balloons);


    for (let i = 0;i < numBalloons; i++){
        let top = parseInt(window.getComputedStyle(balloons[i]).getPropertyValue("top"))  ;
        let left = parseInt(window.getComputedStyle(balloons[i]).getPropertyValue("left"))  ;

        // if (i === 2)
        //     top = top - (i*150)

        //let rand = Math.floor(Math.random() * numColumns);

        if (top<100){
           // balloons[i].classList.add("pop-background");
           // balloons[i].classList.add("pop");

            
            //setTimeout(resetBalloon,300,balloons[i]); //300ms = length of animation
            let rand = Math.floor(Math.random() * numColumns);
            balloons[i].style.top=`${basement}`+'px';
            balloons[i].style.left = `${(rand * 100)+400}`+'px';


        }
        else{
            balloons[i].style.top=`${ top-4 }`+'px';


            //Collision detection
           // let top = parseInt(window.getComputedStyle(balloons[i]).getPropertyValue("top"))  ;
           if (reticleX>=left && reticleX <=left+100 && reticleY>= top && reticleY<=top+150){
            // balloons[i].classList.add('pop-background')
            // balloons[i].classList.add('pop')
                console.log('hit');
                popBalloon(balloons[i]);
        }



        }





       







    }
    // let top = parseInt(window.getComputedStyle(balloonTest).getPropertyValue("top"));
    // console.log(top)


    //  if (top<100){
    //     balloonTest.style.top="650px"
    // }
    // else{
    //     balloonTest.style.top=`${top-2}`+'px';
    // }




}



//Handtrack

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.3,    // confidence threshold for predictions. was .06
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
            reticle.style.top=`${(predictions[1].bbox[1]*scalar)+100}`+'px';
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
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});


