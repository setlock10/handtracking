//const img = document.getElementById('test');

const box1 = document.getElementById('box-1');
const video = document.getElementById('video');
scaleFactor = 1;
//var w = video.videoWidth * scaleFactor;
//var h = video.videoHeight * scaleFactor;
var w = 640;
var h = 480;
var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
var ctx = canvas.getContext('2d');
const frames = [];
const htModel = {};

video.clientWidth = '500px';

handTrack.load().then(model => { 
        console.log(model);
        //htModel = model;
});
handTrack.startVideo(video).then(img=>{
    //console.log(video);
        ctx.drawImage(video, 0, 0, w, h);
        
        setInterval(getFrame,1000)
})

function getFrame(){
    //console.log(ctx.getImageData(0, 0, w, h));
    // if (frames.length <10){
    //     frames.push(ctx.getImageData(0, 0, w, h));
    // }
    // else{
    //     frames.pop();
    //     frames.push(ctx.getImageData(0, 0, w, h));
    // }
   // handTrack.
   
    handTrack.detect(ctx.getImageData(0, 0, w, h)).then(predictions => {
        
        console.log('Predictions: ', predictions); // bbox predictions
        box1.style.left = `${predictions[0].bbox[0]}px`;
        box1.style.top = `${predictions[0].bbox[1]}px`;
        box1.style.width = `${predictions[0].bbox[2]}px`;
        box1.style.height = `${predictions[0].bbox[3]}px`;
          
      });
  

}
