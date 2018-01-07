$(function(){
    var startCameraAbove = function(){
                CameraPreview.startCamera({
                    toBack: false,
                    tapPhoto: false
                });
                takePicture();
    };

    var stopCamera = function(){
                setTimeout(CameraPreview.stopCamera, 6000);
    };

    var takePicture = function(){
               setTimeout(function() {
                   CameraPreview.takePicture(
                        function ( base64PictureData ){
                                imageData = 'data:image/jpeg;base64,' + base64PictureData;
                                $('#originalPicture').attr('src', imageData);

                        }
                    );
                },3000);
                stopCamera();
    };

    $(capturePhoto).on('click', startCameraAbove);
});
