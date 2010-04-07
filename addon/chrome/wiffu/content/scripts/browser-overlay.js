var WIFFU = {

	session_key : null,
	debug_mode: false,
	
	initialize : function() {
		this.debug_mode = getPrefValue('extensions.wiffu.debug');
		if(this.debug_mode) {
			this.toConsole("[WIFFU] Running in DEBUG mode");
			this.toConsole("[WIFFU] wiffing_interval: " + getPrefValue('extensions.wiffu.wiffinterval') + " ms");
		}
	    try {
	        /*
	         *  Get a Foo component
	         */
	        var wiffComponent = 
	        	Components.classes["@wiffer.wiffu.com/java-firefox-extension;1"]
	    			.getService(Components.interfaces.nsIWiffuNativeBridge);
	        
	        /*
	         *  Initialize it. The trick is to get past its IDL interface
	         *  and right into its Javascript implementation, so that we
	         *  can pass it the LiveConnect "java" object, which it will
	         *  then use to load its JARs. Note that XPCOM Javascript code
	         *  is not given LiveConnect by default.
	         */
	        if (!wiffComponent.wrappedJSObject.initialize(java, true)) {
	            alert(wiffComponent.wrappedJSObject.error);
	        }
	    } catch (e) {
	        this.fail(e);
	    }
	},
	
	doIt : function() {
	    try {
	        var wiffComponent = 
						Components.classes["@wiffer.wiffu.com/java-firefox-extension;1"]
	    			.getService(Components.interfaces.nsIWiffuNativeBridge);
	        var test = wiffComponent.wrappedJSObject.getWiffer();
	        test.count();
	    } catch (e) {
	        this.fail(e);
	    }
	},
//	
//	getWiffComponent : function() {
//	    return Components.classes["@simile.mit.edu/java-firefox-extension;1"]
//	    		.getService(Components.interfaces.nsIWiffuNativeBridge);
//	},
	
	toConsole : function (output) {
	    Components.classes["@mozilla.org/consoleservice;1"]
	        .getService(Components.interfaces.nsIConsoleService)
	            .logStringMessage(output);
	},
	
	fail :function(e) {
	    var msg;
	    if (e.getMessage) {
	        msg = e + ": " + e.getMessage() + "\n";
	        while (e.getCause() != null) {
	            e = e.getCause();
	            msg += "caused by " + e + ": " + e.getMessage() + "\n";
	        }
	    } else {
	        msg = e;
	    }
	    alert(msg);
	},
	
	getWiff : function() {
		try {
	        var wiffComponent = 
	        	Components.classes["@wiffer.wiffu.com/java-firefox-extension;1"]
	    			.getService(Components.interfaces.nsIWiffuNativeBridge);
	        var wiffer = wiffComponent.wrappedJSObject.getWiffer();
	        var wiff_data = wiffer.takeWiff();
	        
	    } catch (e) {
	        this.fail(e);
	    }
	    return wiff_data;
	},
	
	xmit : function() {
	  this._request = new XMLHttpRequest();
	  var _this = this;
	  this._request.onreadystatechange = function(){_this.xhrWiffResponseHandler()};
	  this._request.open('POST', getPrefValue('extensions.wiffu.wiff_uri'), true);
	  this._request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
		var wiff = eval('(' + WIFFU.getWiff() + ')') ;
		if(this.debug_mode) {
			this.toConsole("[WIFFU] Wiff From Java Bridge:" + wiff.toJSONString());
		}
		// make the xhr if the session key xhr came back
		if(WIFFU.session_key != null) {
			wiff.username = getPrefValue('extensions.wiffu.username');
			wiff.session_key = WIFFU.session_key;
			if(this.debug_mode) {
				this.toConsole("[WIFFU] Transmitting Wiff: " + "wiff=" + wiff.toJSONString());
				this.toConsole("Sending Request to: " + getPrefValue('extensions.wiffu.wiff_uri'));
				this.toConsole("[WIFFU] Next Wiff in ~" + getPrefValue('extensions.wiffu.wiffinterval') + " ms");
			}
			this._request.send("wiff=" + wiff.toJSONString());
		} else {
			this.toConsole("[WIFFU] No Session Key so Wiff will not be transmitted");
		}
	},
	
	getSessionKey : function() {
		//get a new XMLHTTPRequest and store it in an isntance var.
		this._request = new XMLHttpRequest();
	  //set the var so we can scope the callback
		var _this = this;
	  //callback will be an anonymous function that calls back into our class
		//this allows the call back in which we handle the response (_onData())
		// to have the correct scope.
		this._request.onreadystatechange = function(){_this.xhrWiffResponseHandler()};
	  this._request.open('POST', getPrefValue('extensions.wiffu.wiffsession_uri'), true);
	  this._request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	  
	  var wiff = eval('(' + WIFFU.getWiff() + ')');
	  if(this.debug_mode) {
			this.toConsole("[WIFFU] Wiff From Java Bridge:" + wiff.toJSONString());
		}
	  wiff.username = getPrefValue('extensions.wiffu.username');
	  wiff.password = getPrefValue('extensions.wiffu.password');
		if(this.debug_mode) {
			this.toConsole("[WIFFU] Requesting Session Key\n" + "wiff_session_request=" + wiff.toJSONString());
			this.toConsole("Sending Request to: " + getPrefValue('extensions.wiffu.wiffsession_uri'));
		}
		this._request.send("wiff_session_request=" + wiff.toJSONString());
	},
	xhrWiffResponseHandler: function () {
	  	if (this._request.readyState == 4) {
	       if(this._request.status == 200) {
	       	 if(this.debug_mode) {
	       	 	 this.toConsole("[WIFFU] Recieved status 200 resp:" + this._request.responseText);
	       	 }
	       	 if(this._request.responseText) {
		       	 var session_response = eval('(' + this._request.responseText + ')') ;
		       	 if(session_response.error) {
		         		alert(session_response.error_message);
		         		this.toConsole("[WIFFU] Error resp:" + session_response.toJSONString());
		       	 } else {
		       	 	  if (session_response.session_key) {
		       	 	  	WIFFU.session_key = session_response.session_key;
			       	 		if(this.debug_mode) {
				       	 	  this.toConsole("[WIFFU] session key found in resp:" + WIFFU.session_key);
				       	  }
		       	 	  }
		       	 		
		       	 }
	       	 }
	         
	       } else {
	       	 this.toConsole("[WIFFU] error in resp:" + this._request.responseText);
	       }
	       //clean up
				 delete this._request;
	    }
	  }
}
