$(function(){
    var startCameraAbove = function(){
                CameraPreview.startCamera({
                tapEnabled: false,
                toBack: false,
                previewDrag: false,
                tapPhoto: false});
                takePicture();
    };

    var stopCamera = function(){
                setTimeout(function(){
                    CameraPreview.stopCamera()},
                    6000);
    };

    var takePicture = function(){
               setTimeout(function() {CameraPreview.takePicture({
               width : 640 ,
               height : 640 ,
               quality : 85 },
                    function ( base64PictureData ){
                            imageData = 'data:image/jpeg;base64,' + base64PictureData;
                            document.getElementById('originalPicture').src = imageData;
                            });
                },3000);
                stopCamera();
                };

    document.getElementById('capturePhoto').addEventListener('click', startCameraAbove, false);
});
