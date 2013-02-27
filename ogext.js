//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
TODO:
	remove all unused objects

*/
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

Info('ITP OGame Free Planet Finder Extension [LOADED]');

/// GLOBALS ///
var stripe=true;
var ogeDictionary=new Array;
var colonyShipsAvailable = false;
var slots;
var slotsUsed;
var sendingFleet=null;
var searchRequest;
var currentSystem;
var searchResults = new Array();
var sendingFleet = null;
var stripe = true;
/*searchResults.push(undefined);
for (var i = 1 ; i < 16 ; i++) {searchResults.push(false);}*/
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
function GalaxyViewInjection(){	
	var HTMLForm = '<form class="FPF_form">'
		+ 'Search solar systems from ' 
		//TODO get input id = galaxy_input to read the checkIntInput(,,)
		+ '<input type="text" id="FPF_leftGalaxy" class="FPFSmallNumberInput" value="1">'
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

	//TODO: correct this bloc
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

	//var button = document.getElementById('FPF_searchFreePlanetButton');
	document.getElementById('FPF_searchFreePlanetButton').style.backgroundImage = 'url("'+ chrome.extension.getURL('ressources/greenButton.png')+'")';
	document.getElementById('FPF_searchFreePlanetButton').onclick = FPFSearchFreePlanetClicked;

	setValueChangedListener(document.getElementById('FPF_leftGalaxy'), 1, 10);
	setValueChangedListener(document.getElementById('FPF_rightGalaxy'), 1, 10);
	setValueChangedListener(document.getElementById('FPF_leftSS'), 1, 499);
	setValueChangedListener(document.getElementById('FPF_rightSS'), 1, 499);
	setValueChangedListener(document.getElementById('FPF_closePosition'), 1, 15);
	setValueChangedListener(document.getElementById('FPF_farPosition'), 1, 15);
	/*document.getElementById('FPF_leftGalaxy').onkeyup = galaxyValueChanged;
	document.getElementById('FPF_rightGalaxy').onkeyup = galaxyValueChanged;
	document.getElementById('FPF_leftSS').onkeyup = systemValueChanged;
	document.getElementById('FPF_rightSS').onkeyup = systemValueChanged;
	document.getElementById('FPF_closePosition').onkeyup = positionValueChanged;
	document.getElementById('FPF_farPosition').onkeyup = positionValueChanged;*/
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
/*function galaxyValueChanged(sender) {
	if (this.value == '') {
		setSearchButtonEnabled(false);
		return;
	}
	if (this.value < 1) 
		this.value = 1;
	if (this.value > 10)
		this.value = 10;

	setSearchButtonEnabled(shouldSetButtonEnabled());
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function systemValueChanged(sender) {
	if (this.value == '') {
		setSearchButtonEnabled(false);
		return;
	}
	if (this.value < 1) 
		this.value = 1;
	if (this.value > 499)
		this.value = 499;

	setSearchButtonEnabled(shouldSetButtonEnabled());
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function positionValueChanged(sender) {
	if (this.value == '') {
		setSearchButtonEnabled(false);
		return;
	}
	if (this.value < 1) 
		this.value = 1;
	if (this.value > 15)
		this.value = 15;

	setSearchButtonEnabled(shouldSetButtonEnabled());
}*/
//////////////////////////////////////////////////////////////////////////////////////////////////////
function setValueChangedListener(anObject, minValue, maxValue) {
	anObject.onkeyup = valueChanged;
	anObject.minValue = minValue;
	anObject.maxValue = maxValue;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function valueChanged(sender) {
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
function shouldSetButtonEnabled() {
	console.log('getter');
	var systemDistance = getSystemDistance(document.getElementById('FPF_leftGalaxy').value
										,document.getElementById('FPF_leftSS').value
										,document.getElementById('FPF_rightGalaxy').value
										,document.getElementById('FPF_rightSS').value);
	console.log(systemDistance);
	if (systemDistance < 0) 
		return false;

	var positionDifference = document.getElementById('FPF_farPosition').value - document.getElementById('FPF_closePosition').value;
	console.log(positionDifference);
	if (positionDifference < 0)
		return false;

	return true;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function setSearchButtonEnabled(enabled) {
	console.log('setter');
	if (enabled) {
		console.log('enable');
		document.getElementById('FPF_searchFreePlanetButton').style.backgroundImage = 'url("'+ chrome.extension.getURL('ressources/greenButton.png')+'")';
		document.getElementById('FPF_searchFreePlanetButton').onclick = FPFSearchFreePlanetClicked;
	} else {
		console.log('disable')
		document.getElementById('FPF_searchFreePlanetButton').style.backgroundImage = 'url("'+ chrome.extension.getURL('ressources/greyButton.png')+'")';
		document.getElementById('FPF_searchFreePlanetButton').onclick = null;
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function FPFSearchFreePlanetClicked() {
	slots=parseInt(document.getElementById('slotValue').childNodes[2].nodeValue.match(/\d+/));
	slotsUsed=parseInt(document.getElementById('slotUsed').innerHTML);

	console.log('slots: '+slots);
	console.log('slots used: '+slotsUsed);

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
function incrementCurrentSystem() {
	if (currentSystem.system == 499) {
		currentSystem.galaxy++;
		currentSystem.system = 1;
	} else {
		currentSystem.system++;
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
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
/*function getSystemRemainingCount() {
	//correct count when galaxies are differents
	if (currentSystem.galaxy == searchRequest.rightGalaxy) {
		return searchRequest.rightSystem - currentSystem.system;
	} else {
		return Math.max(0, searchRequest.rightGalaxy - currentSystem.galaxy - 1) * 499 
				+ parseInt(500 - currentSystem.system, 10)
				+ parseInt(searchRequest.rightSystem, 10);
	}
}*/
//////////////////////////////////////////////////////////////////////////////////////////////////////
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
function DocumentLocationFullPathname(){
	return document.location.protocol+'//'+document.location.host+document.location.pathname;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function UpdateProgressBar(){
	var tmp=document.getElementById("FPFRemainingSystems");
	if(tmp) tmp.innerHTML = getSystemDistance(currentSystem.galaxy, currentSystem.system, searchRequest.rightGalaxy, searchRequest.rightSystem);
}
function FPFSearchFinished(result){
	document.getElementById("FPFLoadingImg").style.display='none';
	document.getElementById("FPFRemainingSystems").innerHTML='Free Planet Finder';
	if(result=='error'){
		//Info('DFFSearchFinished with error GALAXY CANNOT BE LOAD /deuter/');
		FPFError();
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function FPFError(){
	var errorMessage=SmartCut(document.body.innerHTML,['case 613',"'"],"'"); //deuterium needed
	var row=document.createElement("tr");
	row.innerHTML='<td class="ogeCenter" colspan="5">'+errorMessage+'</td>';
	row.setAttribute("class","ogeTableItem rowRed");
	document.getElementById("ogeDFFTable").appendChild(row);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function ParseTxt(galaxy, solar, txt){
	var t = document.createElement('div');
	t.innerHTML = txt;
	var f = document.createDocumentFragment();
	f.appendChild(t);
	var galaxyTable = getElementByIdInFragment(f, 'galaxytable');

	if (galaxyTable != null) {
		var tbody = galaxyTable.querySelector('tbody');
			for (var p = parseInt(searchRequest.closePosition, 10) ; p <= searchRequest.farPosition ; p++) {
				//console.log(tbody.childNodes[2*p + 1]); //TODO can you do that using jquery?
				searchResults[p] = (tbody.childNodes[2*(p-1) + 1].querySelector('.' + 'planetname' ) == null);
			}
	}

	if (searchResults.indexOf(true) != -1)
		printSolarSystem();	
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
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
function SendColonyShipsSuccess(){
	sendingFleet.img.src = chrome.extension.getURL('ressources/colonisationSuccess.png');
	//PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet1&cp="+sendingFleet.selectedPlanet,'',function(){}); ???

	sendingFleet = null;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendColonyShipsFailed(){
	sendingFleet.img.src = chrome.extension.getURL('ressources/colonisationFail.png');
	//PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet1&cp="+sendingFleet.selectedPlanet,'',function(){}); ???

	sendingFleet = null;

	/*sendingFleet.img.src=chrome.extension.getURL('recycle-red.gif');
	sendingFleet.img.onclick=sendingFleet.imgOnClick;
	sendingFleet.img.style.cursor=sendingFleet.imgStyleCursor;
	sendingFleet.img.title=sendingFleet.imgTitle;
	sendingFleet=null;*/
	//Info('SendRecyclersFailed');	
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function getElementByIdInFragment(fragment, id) {
    if (fragment.querySelector) {
        return fragment.querySelector('#' + id);
    } else {
        return null;
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
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