
        jQuery.fn.extend({
                disable: function(state) {
                    return this.each(function() {
                    this.disabled = state;
                });
            }
        });

        var apiKey = "6b1ecc4c02fe4745a7c36d2684449d97";
        var apiUrl = "https://westus.api.cognitive.microsoft.com/face/v1.0/detect";
        var params = {
            "visualFeatures": "Categories,Description,Color",
            "details": "",
            "language": "en",
        };

        function makeblob(dataURL) {
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
                var parts = dataURL.split(',');
                var contentType = parts[0].split(':')[1];
                var raw = decodeURIComponent(parts[1]);
                return new Blob([raw], { type: contentType });
            }
            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], { type: contentType });
        };

        function callAPI(file, apiUrl, apiKey){   
            console.log("api called");
                $.ajax({
                    url: "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze?" + $.param(params),
                    beforeSend: function(xhrObj){
                    // Request headers
                    xhrObj.setRequestHeader("Content-Type","application/octet-stream");
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",apiKey);
                    },
                    type: "POST",
                    data: makeblob(file),
                    processData: false
                })
                .done(function (response) {
                    console.log("done is called");
                    ProcessResult(response);
                    console.log("done");
                })
                .fail(function (error) {
                    $("#response").text(error.getAllResponseHeaders());
                    var str= JSON.stringify(error.getAllResponseHeaders())
                    console.log(str);
            });
        };

        function ProcessResult(response){
            // var data = JSON.parse(response);
            console.log(JSON.stringify(response));
            console.log(response.description.captions[0].text);
            $("#objectIden").html("<b>Object Identified as :: </b> <label id='identifiedObject'>" + response.description.captions[0].text+"</label>");
        };

        var storedSearchItems;

        $("#btnNutrition").on("click",function(){
            $("#divCanvas").hide();
            $("#divNutrition").show();
            //var nutritionText = "banana";
            var nutritionText = $("#identifiedObject").html();
            $.ajax({
                type: 'GET',
                async: false,
                url: 'https://api.nutritionix.com/v1_1/search/'+nutritionText+'?'+
                    'fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=09784901&appKey=eb1d62406422d480eb3830bd895a46bd',
                success: function(d){
                    $("#nutritionDetails").html("");
                    storedSearchItems = d.hits;
                    //console.log(JSON.stringify(d, null, 2));
                }
            });

            storedSearchItems.map(function(item){
                var x = item.fields;
                $("#nutritionDetails").append(
                    "<table class='table'><thead><tr>" +
                    '<th colspan="2">'+ x.item_name +'</th></tr></thead><tbody>' +
                    '<tr><th>Calories : </th><td>'+ x.nf_calories +'</td></tr>' + 
                    '<tr><th>Serving Size : </th><td>'+ x.nf_serving_size_qty +' ' + x.nf_serving_size_unit + '</td></tr>' + 
                    '<tr><th>Total Fat : </th><td>' + x.nf_total +'</td></tr></tbody></table>');
            });
        });

        $("#btnReturn").on("click",function(){
            $("#divCanvas").show();
            $("#divNutrition").hide();
            resetCanvas();
        });

        function resetCanvas(){
            var canvas= document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0,  canvas.width, canvas.height);
            $("#objectIden").html("Captured Snap!!");
            $('#btnNutrition').disable(true);
        };

        $("#resetImage").on("click",function(){
            resetCanvas();
        });
        // Put event listeners into place
        window.addEventListener("DOMContentLoaded", function() {
            // Grab elements, create settings, etc.
            //toggle();
            var canvas = document.getElementById('canvas');
            var context = canvas.getContext('2d');
            var video = document.getElementById('video');
            var mediaConfig =  { video: true };
            var errBack = function(e) {
                console.log('An error has occurred!', e)
            };

            // Put video listeners into place
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia(mediaConfig).then(function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                });
            }

            /* Legacy code below! */
            else if(navigator.getUserMedia) { // Standard
                navigator.getUserMedia(mediaConfig, function(stream) {
                    video.src = stream;
                    video.play();
                }, errBack);
            } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
                navigator.webkitGetUserMedia(mediaConfig, function(stream){
                    video.src = window.webkitURL.createObjectURL(stream);
                    video.play();
                }, errBack);
            } else if(navigator.mozGetUserMedia) { // Mozilla-prefixed
                navigator.mozGetUserMedia(mediaConfig, function(stream){
                    video.src = window.URL.createObjectURL(stream);
                    video.play();
                }, errBack);
            }

            // Trigger photo take
            document.getElementById('captureImage').addEventListener('click', function() {
                $('#btnNutrition').disable(false);
                context.drawImage(video, 0, 0, 300, 165);
                var dataurl= canvas.toDataURL();
                callAPI(dataurl, apiUrl, apiKey);
            });
            
            document.getElementById('identifyImage').addEventListener('click', function() {
                var file = document.getElementById('filename').files[0];
                callAPI(file, apiUrl, apiKey);
            });
        }, false);

