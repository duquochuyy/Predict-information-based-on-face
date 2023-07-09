const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
]).then(checkBtn);

const btnStartWebcam = document.getElementById("btnStartWebcam");
const btnEndWebcam = document.getElementById("btnEndWebcam");
const imgInput = document.getElementById("imgInput");

function checkBtn() {
  btnStartWebcam.addEventListener("click", startWebcam);
  btnEndWebcam.addEventListener("click", stopWebcam);
  imgInput.addEventListener("change", changeImage);
}

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });

  document.getElementById("video").classList.remove("d-none");
  document.getElementById("img").classList.add("d-none");
}

function stopWebcam() {
  document.getElementById("img").src = "";
  document.querySelectorAll("canvas").forEach((item) => {
    item.remove();
  });
  const videoTracks = video.srcObject.getVideoTracks();
  videoTracks.forEach((track) => {
    track.stop();
  });
  video.srcObject = null;
}

async function changeImage() {
  document.querySelectorAll("canvas").forEach((item) => {
    item.remove();
  });

  const imgInput = document.getElementById("imgInput"); //my file
  const imgShow = document.getElementById("img"); // my img
  imgShow.classList.remove("d-none");
  document.getElementById("video").classList.add("d-none");
  const imgTest = document.getElementById("imgTest");
  var img = await faceapi.bufferToImage(imgInput.files[0]);
  imgShow.src = img.src;

  const canvas = faceapi.createCanvasFromMedia(imgShow);
  document.querySelector(".divVideo").append(canvas);
  faceapi.matchDimensions(canvas, {
    height: imgShow.height,
    width: imgShow.width,
  });
  const detections = await faceapi
    .detectAllFaces(imgShow)
    .withFaceLandmarks()
    .withAgeAndGender()
    .withFaceExpressions();
  //   console.log(detections);
  const resizedDetections = faceapi.resizeResults(detections, {
    height: imgShow.height,
    width: imgShow.width,
  });
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, resizedDetections);
  //   faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

  resizedDetections.forEach((detection) => {
    const box = detection.detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, {
      label: Math.round(detection.age) + " year old \n" + detection.gender,
    });
    drawBox.draw(canvas);
  });
  //   const faceMatcher = new faceapi.faceMatcher(detections);
  //   detections.forEach((detection) => {});
}

video.addEventListener("play", () => {
  document.querySelectorAll("canvas").forEach((item) => {
    item.remove();
  });
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector(".divVideo").append(canvas);
  faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withAgeAndGender()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, {
      height: video.height,
      width: video.width,
    });
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " year old \n" + detection.gender,
      });
      drawBox.draw(canvas);
    });

    // console.log(detections);
  }, 100);
});
