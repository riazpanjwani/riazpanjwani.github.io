var main = function () {
    var instance = {};

    window.addEventListener('load', init);

    function init() {
        logger.Setup(".status_bar");
        console.log("Initializing...");

        var futureTree = oxpddiscovery.GetOXPdDiscoveryTree();

        futureTree.then(function(discoveryTree)
        {
          try
          {
            oxpddeviceinfo.Setup(discoveryTree);
            oxpddeviceinfo.GetManufacturerInfo()
              .then(function(deviceinfo)
              {
                try
                {
                  oxpddeviceinfo.GetManufacturerInfo();
                  document.getElementById("serialnumber").innerHTML = deviceinfo.deviceSerialNumber;
                  document.getElementById("hostname").innerHTML = deviceinfo.hostName;
                  document.getElementById("firmware").innerHTML = deviceinfo.firmwareVersion;
				          document.getElementById("model").innerHTML = deviceinfo.modelName;
				          document.getElementById("network").innerHTML = deviceinfo.ipAddress;
				          document.getElementById("productnum").innerHTML = deviceinfo.productNumber;
				          document.getElementById("mac").innerHTML = deviceinfo.macAddress;
				          console.log("Ready");
                }
                catch(err)
                {
                  console.log('ManufacturerInfo: ' + 'err.name="' + err.name + '", ' + 'err.message="' + err.message);
                }
              }
              );
            }
            catch(err)
            {
              console.log('DiscoveryTree: ' + 'err.name="' + err.name + '", ' + 'err.message="' + err.message);
            }
          }
        );
    };

    instance.print = function (document_location) {

		/*var ip = "localhost";
		oxpddiscovery.Setup(ip);
		var printTree = oxpddiscovery.GetOXPdDiscoveryTree();

		//Setup OXPd Print
		printTree.then(
			function (tree) {
				try{
					oxpdprint.Setup(tree, ip);
					console.log("Initializing printer...");
				} catch {
					console.error(error);
				}
			},
			function(error){
				console.error(error);
			}
		);*/
        // Submit the print job
        var futurePrint = oxpdprint.PrintUri({
            documentUri: document_location
        });

        // Monitor the job progress using polling
        futurePrint.then(function (jobId) {
                var interval = setInterval(function () {
                    var futureJob = oxpdprint.GetJobAttributes(jobId);
                    futureJob.then(function (job) {

                            if (job.jobState === oxpdprint.JobState.Aborted ||
                                job.jobState === oxpdprint.JobState.Canceled ||
                                job.jobState === oxpdprint.JobState.Completed) {
                                // Job is complete
                                console.log(document_location + " : " + job.jobStateReasons);
                                clearInterval(interval);

                            } else {
                                // Job is still being processed
                                console.log(document_location + " : " + job.jobState + " job " + jobId + "...");
                            }
                        },
                        function (error) {
                            console.error(error);
                            clearInterval(interval);
                        })
                }, 200);
            },
            function (error) {
                console.error(error);
                alert("Uh oh...\nLooks like something went wrong!\n\n" + document_location + "\n\n" + error);
            });
    };

    return instance;
}();
