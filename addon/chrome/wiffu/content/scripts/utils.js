/**
 * 
 */
function getPrefValue(pref_name) {
	
	// get reference to the preferences at the root level
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefBranch);
	// query the type, then return the value
	var prefValue;
	if (prefs.getPrefType(pref_name) == prefs.PREF_INVALID){
	    prefValue = null;
	} else if (prefs.getPrefType(pref_name) == prefs.PREF_INT){
	    prefValue = prefs.getIntPref(pref_name);
	} else if(prefs.getPrefType(pref_name) == prefs.PREF_BOOL) {
		prefValue = prefs.getBoolPref(pref_name);
	} else { // must be a string
		prefValue = prefs.getCharPref(pref_name);
		//prefValue = nsPreferences.copyUnicharPref(pref_name);
	}
 	return prefValue;

}
var minimum_wiffing_interval = 1000; // 1 second
var wiffing_cycle = null;

function startWiffingCycle() {
	/*
	 * Get the session key (async call: WIFFU.xmit() checks
	 * that it completed before making xhr.
	 */
	WIFFU.getSessionKey(); 
	var wiffing_interval = getPrefValue('extensions.wiffu.wiffinterval');
	if(wiffing_interval >= minimum_wiffing_interval) {
		wiffing_cycle = setInterval('WIFFU.xmit()', wiffing_interval);
	} else {
		alert('Wiffing interval ['+ wiffing_interval + '], was below minimum of ['+ minimum_wiffing_interval + ']. Wiffing will not start');
		clearInterval(wiffing_cycle);
	}
}



var newwindow = null;
function popitup(url) {
	newwindow=window.open(url,'name','height=600,width=400');
	if (window.focus) {newwindow.focus()}
	return false;
}
function writeToDebug(debug_text) {
	// create a new link and a text
  var debug_element=newwindow.document.createElement('p');
  pickText=newwindow.document.createTextNode(debug_text);

	// add the text as a child of the link
	debug_element.appendChild(pickText);
	newwindow.document.getElementById('container').appendChild(debug_element);
	
	return false;
}
