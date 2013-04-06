//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
TODO:
	keep used slots updated when sending a ship
	seperate private and pulic functions
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	This is the main file of the chrome extension.
	This adds a form to the galaxy view on the onligne game ogame (see ogame.*)
	One the form is filled, the user can scan his univers and the extensions indicated free planets
	that are ready to be colonised
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

Info('ITP OGame Free Planet Finder Extension [LOADED]');
getSystemMaxNumber();

/// GLOBALS ///
var stripe=true;							// used to give different colors to rows
var colonyShipsAvailable = false;			// true if the player has any colony ship available on the current planet
var slots;									// number of fleet slots the user is allowed to
var slotsUsed;								// number of fleet slots the user is using
var sendingFleet=null;						// informations about the fleet being sent (null if no fleet is being sent)
var searchRequest;							// the limit solar systems and positions to be searched
var currentSystem;							// current system being scanned
var searchResults = new Array();			// results of a solar system scan
//////////////////////////////////////////////////////////////////////////////////////////////////////
var moduleDomId='OGame Free Planet Finder Extension';
IsModuleLoaded(moduleDomId,true);
//////////////////////////////////////////////////////////////////////////////////////////////////////
if(document.location.href.indexOf('page=galaxy')!=-1){
	GalaxyViewInjection();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Inject the form into the galaxy view
	Also activates a set a trigers on the form entries
*/
function GalaxyViewInjection(){	
	var HTMLForm = '<form class="FPF_form">'
		+ 'Search solar systems from ' 
		+ '<input type="text" id="FPF_leftGalaxy" pattern="[0-9]*" size="3" class="FPFSmallNumberInput" value="1">'
		+ '<input type="text" id="FPF_leftSS" class="FPFSmallNumberInput" value="1">'
		+ 'to'
		+ '<input type="text" id="FPF_rightGalaxy" class="FPFSmallNumberInput" value="1">'
		+ '<input type="text" id="FPF_rightSS" class="FPFSmallNumberInput" value="1">'
		+ '<br/>'
		+ 'Search positions from'
		+ '<input type="text" id="FPF_closePosition" class="FPFSmallNumberInput" value="1" onkeyup="checkIntInput(this, 1, 15)">'
		+ 'to'
		+ '<input type="text" id="FPF_farPosition" class="FPFSmallNumberInput" value="15" onkeyup="checkIntInput(this, 1, 15)">'
		+ '<br/>'
		+ '<a id="FPF_searchFreePlanetButton" class="FPFLaunchButton" style="background-image: url('+chrome.extension.getURL('ressources/greenButton.png')+'"")>Search</a>'
		+ '</form>';

	var innerHTML = ''
		+ '<div style="text-align:center;background:url('+chrome.extension.getURL('ressources/newsboxheader.gif')+') no-repeat;height:30px;">'
		+ '<span class="ogeBoxTitle">'+'Free Planete Finder'+'</span>'
		+ '</div>'
		+ '<div id="FPFFormBox" style="padding:10px;background: url('+chrome.extension.getURL('ressources/frame_body.gif')+') repeat-y;">'+HTMLForm
		+ '<div id="SFDSendingFleets"></div>'
		+'</div>'
		+ '<div style="background: url('+chrome.extension.getURL('ressources/frame_footer.gif')+') no-repeat;height:30px;"></div>';
			
	var extDiv = document.createElement("div");
		extDiv.id = "FPFBox"
		extDiv.setAttribute("style","margin-left:10px;width:650px;background-color:#22313b");
		extDiv.innerHTML = innerHTML;

	document.getElementById("inhalt").appendChild(extDiv);

	document.getElementById('FPF_searchFreePlanetButton').style.backgroundImage = 'url("'+ chrome.extension.getURL('ressources/greenButton.png')+'")';
	document.getElementById('FPF_searchFreePlanetButton').onclick = FPFSearchFreePlanetClicked;

	setValueChangedListener(document.getElementById('FPF_leftGalaxy'), 1, getGalaxyMaxNumber());
	setValueChangedListener(document.getElementById('FPF_rightGalaxy'), 1, getGalaxyMaxNumber());
	setValueChangedListener(document.getElementById('FPF_leftSS'), 1, getSystemMaxNumber());
	setValueChangedListener(document.getElementById('FPF_rightSS'), 1, getSystemMaxNumber());
	setValueChangedListener(document.getElementById('FPF_closePosition'), 1, 15);
	setValueChangedListener(document.getElementById('FPF_farPosition'), 1, 15);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	PRIVATE

	returns the maximum galaxy number in this universe
*/
function getGalaxyMaxNumber() {
	var t = document.getElementById('galaxy_input').getAttribute('onkeyup').match(/\d+/g);

	return parseInt(t[1], 10);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	PRIVATE

	returns the maximum solar system number in this universe
*/
function getSystemMaxNumber() {
	var t = document.getElementById('system_input').getAttribute('onkeyup').match(/\d+/g);

	return parseInt(t[1], 0);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
// deprecated
/*function copyInputAttributs(myInput, ogameInput) {
	myInput.maxLength = ogameInput.maxLength;
	myInput.pattern = ogameInput.pattern;
	myInput.size = ogameInput.size;
}*/
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	General setter for the function valueChanged
	To be used an a text input. The function will check that the value the user enter is between
	minValue ad maxValue

	anObject: the text input element on which the trigger is to be set
	minValue: (int) the minimum value that the entry should accept
	maxValue: (int) the maximum value that the entry should accept
*/
function setValueChangedListener(anObject, minValue, maxValue) {
	anObject.onkeyup = valueChanged;
	anObject.minValue = minValue;
	anObject.maxValue = maxValue;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	PRIVATE FUNCTION

	A function that check if the sender value is between a min and a max value.
	This trigger is to be set with setValueChangedListener(anObject, minValue, maxValue)
*/
function valueChanged(sender) {
	//keep only numbers
	this.value = this.value.replace(/\D+/, '');

	if (this.value == '') {
		setSearchButtonEnabled(false);
		return;
	}
	if (this.value < this.minValue) 
		this.value = this.minValue;
	if (this.value > this.maxValue)
		this.value = this.maxValue;

	setSearchButtonEnabled(shouldSetButtonEnabled());
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	return true if the search button should be enabled, false otherwise
*/
function shouldSetButtonEnabled() {
	var systemDistance = getSystemDistance(document.getElementById('FPF_leftGalaxy').value
										,document.getElementById('FPF_leftSS').value
										,document.getElementById('FPF_rightGalaxy').value
										,document.getElementById('FPF_rightSS').value);
	if (systemDistance < 0) 
		return false;

	var positionDifference = document.getElementById('FPF_farPosition').value - document.getElementById('FPF_closePosition').value;
	if (positionDifference < 0)
		return false;

	return true;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Sets the search button to enabled
*/
function setSearchButtonEnabled(enabled) {
	if (enabled) {
		document.getElementById('FPF_searchFreePlanetButton').style.backgroundImage = 'url("'+ chrome.extension.getURL('ressources/greenButton.png')+'")';
		document.getElementById('FPF_searchFreePlanetButton').onclick = FPFSearchFreePlanetClicked;
	} else {
		document.getElementById('FPF_searchFreePlanetButton').style.backgroundImage = 'url("'+ chrome.extension.getURL('ressources/greyButton.png')+'")';
		document.getElementById('FPF_searchFreePlanetButton').onclick = null;
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	To be launched when the user clicks on the search button.
	Reads the form entries, injects the search result view and lauches the searching process
*/
function FPFSearchFreePlanetClicked() {
	slots=parseInt(document.getElementById('slotValue').childNodes[2].nodeValue.match(/\d+/));
	slotsUsed=parseInt(document.getElementById('slotUsed').innerHTML);

	searchRequest = new Object();
	searchRequest.leftGalaxy = document.getElementById('FPF_leftGalaxy').value;
	searchRequest.leftSystem = document.getElementById('FPF_leftSS').value;
	searchRequest.rightGalaxy = document.getElementById('FPF_rightGalaxy').value;
	searchRequest.rightSystem = document.getElementById('FPF_rightSS').value;
	searchRequest.closePosition = document.getElementById('FPF_closePosition').value;
	searchRequest.farPosition = document.getElementById('FPF_farPosition').value;


	currentSystem = new Object();
	currentSystem.galaxy = searchRequest.leftGalaxy;
	currentSystem.system = searchRequest.leftSystem;

	injectFPFView();

	document.getElementById("FPFLoadingImg").style.display='inline';

	FPFSearch('');
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Removes the current views and inject the results view instead
*/
function injectFPFView() {
	var coordsStr=document.getElementById("galaxyheadbg2").childNodes[1].innerHTML; //Planeta
	colonyShipsAvailable = (document.getElementsByClassName('tooltip planetMoveIcons colonize-active icon').length > 0);
	//var recyclersStr=document.getElementById("recycler").childNodes[2].nodeValue.replace(/^\s+|\s+$/g,"");
	var actionStr=document.getElementById("galaxyheadbg2").childNodes[15].innerHTML;

	var tableHTML = ''
		+ '<table id="FPFTable" class="FPFTable" cellspacing="0" cellpadding="0" style="margin-top:10px;">'
			+ '<tr id="FPFTableHeader" class="FPFTableHeader">'
				+ '<td class="FPFTableSSCol">Solar system</td>';
				for (var i = parseInt(searchRequest.closePosition, 10) ; i <= searchRequest.farPosition ; i++) {
					tableHTML += '<td class="FPFTablePositionCol">P'+i+'</td>';
				}
		tableHTML += '</tr>'
		+ '</table>';

		
	var innerHTML='<div id="planet" style="height:250px;background-image:url('+chrome.extension.getURL('ressources/oge-probe-bg.jpg')+')">'
	+ '<div id="header_text"><h2>Free Planet Finder</h2></div>'
	+ '</div>'
	+ '<div class="c-left" style="position:absolute;top:214px;"></div><div class="c-right" style="position:absolute;top:214px;"></div>'
	+ '<div style="margin-top:5px;text-align: center;background: url('+chrome.extension.getURL('ressources/frame_header.gif')+') no-repeat;height:30px;">'
	+ '<div class="ogeWindowHeader">'
	+ '<span>&nbsp</span>'
	+ '<img id="FPFLoadingImg" style="display: none;" src="'+chrome.extension.getURL('ressources/loading.gif')+'">'
	+ '<span id="FPFRemainingSystems">'+getSystemDistance(currentSystem.galaxy, currentSystem.system, searchRequest.rightGalaxy, searchRequest.rightSystem)+'</span>'
	+ '</div>'
	+ '<div id="ogeDFFContext" style="padding:20px;background: url('+chrome.extension.getURL('ressources/frame_body.gif')+') repeat-y;">'+    tableHTML        +'</div>'
	+ '<div style="background: url('+chrome.extension.getURL('ressources/frame_footer.gif')+') no-repeat;height:30px;"></div>';
	document.getElementById("inhalt").innerHTML=innerHTML;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Updates the progress bar, prints the positive results and launches the next system search (if there is any)
*/
function FPFSearch(txt){
	if(txt!=''){
		UpdateProgressBar();
		ParseTxt(currentSystem.galaxy, currentSystem.system, txt);
		incrementCurrentSystem();
	}
	
	if(FPFShouldContinue()){
		var fd='galaxy='+currentSystem.galaxy+'&system='+currentSystem.system;
		PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=galaxyCanLoad&ajax=1",fd,FPFSearchCanLoad);
	}else{
		FPFSearchFinished();
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Increments the global variable representing the system currently being scanned
*/
function incrementCurrentSystem() {
	if (currentSystem.system == 499) {
		currentSystem.galaxy++;
		currentSystem.system = 1;
	} else {
		currentSystem.system++;
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Returns true if there is still solar system to be scanned, false otherwise
*/
function FPFShouldContinue() {
	if (parseInt(currentSystem.galaxy, 10) > parseInt(searchRequest.rightGalaxy, 10)) { //had to add parseInt for the chrome not to think it's a string...
		return false;
	} else if (currentSystem.galaxy == searchRequest.rightGalaxy
				&& currentSystem.system > searchRequest.rightSystem) {
		return false;
	}

	return true;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	returns the number of solar systems between two given coordinates

	g1: the first system galaxy number
	s1: the first system system number
	g2: the second system galaxy number
	s2: the second system system number
*/
function getSystemDistance(g1, s1, g2, s2) {
	//correct count when galaxies are differents
	if (g2 == g1) {
		return s2 - s1;
	} else if (g2 > g1) {
		return Math.max(0, g2 - g1 - 1) * 499 
				+ parseInt(500 - g1, 10)
				+ parseInt(g2, 10);
	} else {
		return Math.min(0, g2 - g1 - 1) * 499 
				+ parseInt(500 - g1, 10)
				+ parseInt(g2, 10);
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Launches a system scan
*/
function FPFSearchCanLoad(txt){
	eval('var r=new Object('+txt+')');
	if(r.status){
		var fd='galaxy='+currentSystem.galaxy+'&system='+currentSystem.system;
		PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=galaxyContent&ajax=1",fd,FPFSearch);
	}else{
		FPFSearchFinished('error');
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	TODO: comment
*/
function DocumentLocationFullPathname(){
	return document.location.protocol+'//'+document.location.host+document.location.pathname;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Updates the progress bar
*/
function UpdateProgressBar(){
	var tmp=document.getElementById("FPFRemainingSystems");
	if(tmp) tmp.innerHTML = getSystemDistance(currentSystem.galaxy, currentSystem.system, searchRequest.rightGalaxy, searchRequest.rightSystem);
}
/**
	Launched when all system have been scanned.
	Hides the progress bar and prints 'Free Planet Finder' instead
*/
function FPFSearchFinished(result){
	document.getElementById("FPFLoadingImg").style.display='none';
	document.getElementById("FPFRemainingSystems").innerHTML='Free Planet Finder';
	if(result=='error'){
		FPFError();
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Launched when an error happens
	Prints an error message
*/
function FPFError(){
	var errorMessage=SmartCut(document.body.innerHTML,['case 613',"'"],"'"); //deuterium needed
	var row=document.createElement("tr");
	row.innerHTML='<td class="ogeCenter" colspan="5">'+errorMessage+'</td>';
	row.setAttribute("class","ogeTableItem rowRed");
	document.getElementById("ogeDFFTable").appendChild(row);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Scans the system data on txt (HTML),
	fills searchResults indexes with true if the position is empty, false otherwise

	Prints the positive results

	galaxy: the galaxy number of the txt to be parsed
	solar: the solar system number of the txt to be parsed
	txt: the HTML text to be parsed
*/
function ParseTxt(galaxy, solar, txt){
	var t = document.createElement('div');
	t.innerHTML = txt;
	var f = document.createDocumentFragment();
	f.appendChild(t);
	var galaxyTable = getElementByIdInFragment(f, 'galaxytable');

	if (galaxyTable != null) {
		var tbody = galaxyTable.querySelector('tbody');
			for (var p = parseInt(searchRequest.closePosition, 10) ; p <= searchRequest.farPosition ; p++) {
				searchResults[p] = (tbody.childNodes[2*(p-1) + 1].querySelector('.' + 'planetname' ) == null);
			}
	}

	if (searchResults.indexOf(true) != -1)
		printSolarSystem();	
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Injects a row in the results table
	The row indicated the solar system and images on the free plantes.
	The images are buttons if the user has any available colony ship
*/
function printSolarSystem() {
	var row=document.createElement("tr");
	HTMLTableRow = ''
			+ '<td class="FPFTableSSCol">'
				+ currentSystem.galaxy+':'+currentSystem.system+':x    '
				+ '<a title="System '+currentSystem.galaxy+':'+currentSystem.system+'"'
					+' href="http://uni106.ogame.fr/game/index.php?page=galaxy&galaxy='+currentSystem.galaxy+'&system='+currentSystem.system+'" id="FPFSolarSystem">'
					+ '<img title id="FPFShowSystem_'+currentSystem.galaxy+'_'+currentSystem.system+'" src="'+chrome.extension.getURL('ressources/eye.gif')+'"/>'
				+ '</a>'
			+ '</td>';
	for (var i = parseInt(searchRequest.closePosition, 10) ; i <= searchRequest.farPosition ; i++) {
		HTMLTableRow += '<td class="FPFTablePositionCol">';
		if (searchResults[i]) {
			if (colonyShipsAvailable) {
				HTMLTableRow += '<img title="Send colony ship to '+currentSystem.galaxy+':'+currentSystem.system+':'+i+'" '
						+ 'id="FPFSendColoShip_'+currentSystem.galaxy+'_'+currentSystem.system+'_'+i+'" src="'+chrome.extension.getURL('ressources/colonisationPossible.png')+'"/>';
			} else {
				HTMLTableRow += '<img title="No colony ship available" src="'+chrome.extension.getURL('ressources/colonisationImpossible.png')+'"/>';
			}
		}  
		HTMLTableRow += '</td>';
	}
	row.innerHTML += HTMLTableRow;
	if(stripe) row.setAttribute("class",row.getAttribute("class")+" rowStripe");
	stripe=!stripe;
	document.getElementById("FPFTable").appendChild(row);

	for (var i = parseInt(searchRequest.closePosition, 10) ; i <= searchRequest.farPosition ; i++) {
		if (document.getElementById('FPFSendColoShip_'+currentSystem.galaxy+'_'+currentSystem.system+'_'+i) != null) {
			var img = document.getElementById('FPFSendColoShip_'+currentSystem.galaxy+'_'+currentSystem.system+'_'+i);
			img.onclick = FPFSendColoShipClicked;
			img.galaxy = currentSystem.galaxy;
			img.system = currentSystem.system;
			img.position = i;
		}
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Trigger launched when the user clicks on a button in order to launch a colony ship
	Launches the colony ship at the clicked coordinates

	sender: the button that have been clicked 
*/
function FPFSendColoShipClicked(sender) {
	if (sendingFleet == null) {
		sendingFleet = new Object();
		sendingFleet.step = 1;
		sendingFleet.img = sender.srcElement;
		sendingFleet.galaxyDest = sender.srcElement.galaxy;
		sendingFleet.systemDest = sender.srcElement.system;
		sendingFleet.planetDest = sender.srcElement.position;

		sendingFleet.img.src = chrome.extension.getURL('ressources/loading.gif');
		PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet1",'',SendColonyShip);
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Callback function when sending a colony ship

	Launch the next step of the sending if any.
	Shows succes or error if any.

	response: the response the function recieved from the server
*/
function SendColonyShip(response) {
	var txt=SmartCut(response,'<body id="','"');
	var gsp='galaxy='+sendingFleet.galaxyDest+'&system='+sendingFleet.systemDest+'&position='+sendingFleet.planetDest; // target???
	switch(txt)
	{
	case 'fleet1':
		if(sendingFleet.step==1){
			sendingFleet.step++;
			var fd=gsp+'&type=1&mission=0&speed=10&am208=1';
			PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet2",fd,SendColonyShip);			
		}else{SendColonyShipsFailed()}
	break;
	case 'fleet2':
		if(sendingFleet.step==2){
			sendingFleet.step++;
			var fd='type=1&mission=0&union=0&am208=1&'+gsp+'&speed=10';
			PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet3",fd,SendColonyShip);
		}else{SendColonyShipsFailed()}
	break;
	case 'fleet3':
		if(sendingFleet.step==3){
			var token='&token='+SmartCut(response,["token'","='"],"'");
			
			sendingFleet.step++;
			var fd='holdingtime=1&expeditiontime=1&'+gsp+'&type=1&mission=7&union2=0&holdingOrExpTime=0&speed=10&am208=1&metal=0&crystal=0&deuterium=0';
			fd+=token;
			PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=movement",fd,SendColonyShip);
		}else{SendColonyShipsFailed()}
	break;
	case 'movement':
		if((sendingFleet.step==4)/*&&(response.indexOf('['+sendingFleet.coord+']')!=-1)*/){
			SendColonyShipsSuccess();
		}else{SendColonyShipsFailed()}
	break;
	default:
		SendColonyShipsFailed()
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Changes the launching icon to a other icon indicating succes
*/
function SendColonyShipsSuccess(){
	sendingFleet.img.src = chrome.extension.getURL('ressources/colonisationSuccess.png');

	sendingFleet = null;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Changes the launching icon to a other icon indicating failure
*/
function SendColonyShipsFailed(){
	sendingFleet.img.src = chrome.extension.getURL('ressources/colonisationFail.png');

	sendingFleet = null;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	returns an element with the id id from the fragment fragment.

	fragment: the fragment to be searched
	id: the id you to search for
*/
function getElementByIdInFragment(fragment, id) {
    if (fragment.querySelector) {
        return fragment.querySelector('#' + id);
    } else {
        return null;
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
	Prints text in the console

	text a string or a table to be printed in the console
*/
function Info(text){
	var txt="";
	for( var i = 0; i < arguments.length; i++ ) txt+=arguments[i];
	console.log(txt);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SmartCut(source,prefix,suffix){
	if(typeof(prefix)=='object'){
		var pi=0;
		var offset=0;
		for(var i=0;(i<prefix.length)&&(pi!=-1);i++){
			pi=source.indexOf(prefix[i],pi+offset);
			offset=prefix[i].length;
		}
		if(pi!=-1){
			var copyFrom=pi+offset;
			var si=source.indexOf(suffix,copyFrom);
			var r=source.substring(copyFrom,si);
			return r;
		}else return false;
	}else{
		var pi=source.indexOf(prefix);
		if(pi!=-1){
			var si=source.indexOf(suffix,pi+prefix.length);
			var r=source.substring(pi+prefix.length,si);
			return r;
		}else return false;
	};
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function getXmlHttp() {
   if (window.XMLHttpRequest) {
      xmlhttp=new XMLHttpRequest();
   } else if (window.ActiveXObject) {
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
   }
   if (xmlhttp == null) {
      alert("Your browser does not support XMLHTTP.");
   }
   return xmlhttp;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function PostXMLHttpRequest(_url,_data,_callback){
	xmlhttp = getXmlHttp();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4) {
			_callback(xmlhttp.responseText);
		}
	}
	xmlhttp.open("POST", _url, true);
	xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlhttp.send(_data);
	return xmlhttp;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function IsModuleLoaded(_moduleDomId,_add){
	var modules=document.head.getElementsByClassName("oge-loaded-module"), result=false;
	for(var i=0;i<modules.length;i++){
		if(modules[i].getAttribute("content")==_moduleDomId) {result=true;break}
	}
	if(!result && _add){
		var flag=document.createElement("meta");
		flag.setAttribute("class","oge-loaded-module");
		flag.setAttribute("content",_moduleDomId);
		document.head.appendChild(flag);
	}
	return result;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function getElementByAttr(e,attr,value)
{
	var tab = [];
	if (e.getAttribute && e.getAttribute(attr)==value)
	  tab.push(e);
 
	var n = e.firstChild;
	if (n==null || typeof n=='undefined') return tab;
	do
	{
	  var tab2 = getElementByAttr(n,attr,value);
		tab = tab.concat(tab2);
	}while((n = n.nextSibling)!=null)
	return tab;
}