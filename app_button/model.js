function runScript(){
	var config = JSON.stringify('');
	if(config!=undefined){


//var config;
//if(config!=undefined){
	function Hilitor(tag){
		var targetNode = document.body;
		var hiliteTag = "MARK";
		var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT)$");
		var colors = ["#f57931"];
		var wordColor = [];
		var colorIdx = 0;
		var matchRegExp = "";
		var openLeft = false;
		var openRight = false;
		// characters to strip from start and end of the input string
		var endRegExp = new RegExp('^[^\\w]+|[^\\w]+$', "g");
		// characters used to break up the input string into words
		// var breakRegExp = new RegExp('[^\\w\'-]+', "g");
		var breakRegExp = endRegExp;

		this.setEndRegExp = function(regex) {
			endRegExp = regex;
			return endRegExp;
		};

		this.setBreakRegExp = function(regex) {
		    breakRegExp = regex;
		    return breakRegExp;
		};

		this.setMatchType = function(type){
		    switch(type){
		      case "left":
		        this.openLeft = false;
		        this.openRight = true;
		        break;
		      case "right":
		        this.openLeft = true;
		        this.openRight = false;
		        break;
		      case "open":
		        this.openLeft = this.openRight = true;
		        break;
		      default:
		        this.openLeft = this.openRight = false;
		    }
		};

		this.setRegex = function(input){
		    input = input.replace(endRegExp, "");
		    input = input.replace(breakRegExp, "|");
		    input = input.replace(/^\||\|$/g, "");
		    if(input) {
		    	var re = "(" + input + ")";
		    	if(!this.openLeft) {
		        re = "\\b" + re;
		    }
		    if(!this.openRight) {
		        re = re + "\\b";
		    }
		    matchRegExp = new RegExp(re, "i");
		    return matchRegExp;
		    }
		    return false;
		  };

		this.getRegex = function(){
		    var retval = matchRegExp.toString();
		    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
		    retval = retval.replace(/\|/g, " ");
			//alert(resp[key].sentence);
		    return retval;
		};

		// recursively apply word highlighting
		this.hiliteWords = function(node){
		    if(node === undefined || !node) return;
		    if(!matchRegExp) return;
		    if(skipTags.test(node.nodeName)) return;

		    if(node.hasChildNodes()) {
		      for(var i=0; i < node.childNodes.length; i++)
		        this.hiliteWords(node.childNodes[i]);
		    }
		    if(node.nodeType == 3) { // NODE_TEXT
		      if((nv = node.nodeValue) && (regs = matchRegExp.exec(nv))) {
				regs[0] = nv;
				//alert(nv);
		        if(!wordColor[regs[0].toLowerCase()]) {
		          wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
		        }

		        var match = document.createElement(hiliteTag);
		        match.appendChild(document.createTextNode(regs[0]));
		        match.style.backgroundColor = wordColor[regs[0].toLowerCase()];
		        match.style.color = "#000";

		        var after = node.splitText(regs[0].index);
		        after.nodeValue = after.nodeValue.substring(regs[0].length);
		        node.parentNode.insertBefore(match, after);
		      }
		    };
	  	};

	  	// remove highlighting
	  	this.remove = function(){
		    var arr = document.getElementsByTagName(hiliteTag);
		    while(arr.length && (el = arr[0])) {
		    	var parent = el.parentNode;
		    	parent.replaceChild(el.firstChild, el);
		    	parent.normalize();
		    }
		};

	  	// start highlighting at target node
	  	this.apply = function(input){
		    // this.remove();
		    if(input === undefined || !(input = input.replace(/(^\s+|\s+$)/g, ""))) {
		      return;
		    }
		    if(this.setRegex(input)) {
		      this.hiliteWords(targetNode);
		    }
		    return matchRegExp;
		};
	}


	//Function Save//
	function Save(ans, user_email)
	{
		var user_decision = ans;

		const API_URL = '/api'
		var xhttps = new XMLHttpRequest();
		var settings1 = {
		"async": true,
		"crossDomain": true,
		// "url": "http://127.0.0.1:5000/Save",
		"url": "https://covidplugin-2021.herokuapp.com/Save",
		"method": "POST",
		"headers": {
		  "content-type": "application/json"
		},
		"save": JSON.stringify(user_decision),
		}
		var post_data = JSON.stringify({"save":encodeURIComponent(user_decision), "email":encodeURIComponent(user_email)});
		xhttps.open(settings1.method, settings1.url, settings1.async);
		xhttps.setRequestHeader("Content-type", "application/json");
		xhttps.send(post_data);

		//alert(ans);
	}

	chrome.runtime.sendMessage({ message: 'request_user_email' }, function (response) {
		if (response.message === 'status_not_updated'){
			Swal.fire({
			title: 'COVID-19 False Detector',
			text: "Our database has not updated your sign in status. Please refresh the page once for our database to update your sign in status.",
			icon: 'info',
			showCancelButton: false,
			confirmButtonColor: '#3085d6',
			confirmButtonText: 'Understood!',
		});
		}
		else{
			var user_email =  JSON.stringify(response.message);
			let TrainData = document.body.innerText;
			let TargetData = 'Button';
			let source_url = window.location.href;
			var settings = {
			"async": true,
			"crossDomain": true,
			// "url": "http://127.0.0.1:5000/analyze",
			"url": "https://covidplugin-2021.herokuapp.com/analyze",
			"method": "POST",
			"headers": {
			  "content-type": "application/json"
			},
			"article": JSON.stringify(TrainData),
			"test_data": JSON.stringify(TargetData),
			}

			 var xhttp = new XMLHttpRequest();
			 xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var myHilitor = new Hilitor();
					myHilitor.remove();
					var obj = JSON.parse(this.responseText);
					var model_result = obj.result;
					var model_user = obj.user;

					var model_result = obj.result;
						if (model_result !== 'NONE')
							{
								Swal.fire({
								title: 'COVID-19 False Detector',
								text: "This page contains COVID-19 information. Do you want to check the results?",
								icon: 'info',
								showCancelButton: true,
								confirmButtonColor: '#3085d6',
								cancelButtonColor: '#d33',
								confirmButtonText: 'Yes!',
								cancelButtonText: 'No!'
								}).then((result) => {
								if (result.isConfirmed) {
									Save(('Button_Yes'), user_email);
									if (model_result == 'REAL'|| model_result == 'TRUE')
									{
										Swal.fire('',"This page contains accurate information on COVID-19.",'success')
									}
									else
									{

										Swal.fire('',"The highlighted sections on this page contain inaccurate information on COVID-19.",'error')
										if(obj.match==true)
											{
											var resp = obj.resp;
											for (var key in resp)
												{
												myHilitor.apply(resp[key].sentence);
												}
											}
									}
								}
								else {
									Save(('Button_No'), user_email);
								}
								})


							}
				}

			};

			var post_data = JSON.stringify({"article":encodeURIComponent(TrainData),"test_data":encodeURIComponent(TargetData),"url":encodeURIComponent(source_url), "user_email":encodeURIComponent(user_email)});
			xhttp.open(settings.method, settings.url, settings.async);
			xhttp.setRequestHeader("Content-type", "application/json");
			xhttp.send(post_data);
			}
	});

}
}

function checkstatus() {
    chrome.runtime.sendMessage({ message: 'user_signed_in_status' }, function (response) {
        if (response.message === 'success') {
        	runScript();
        }
    });
}

checkstatus();
