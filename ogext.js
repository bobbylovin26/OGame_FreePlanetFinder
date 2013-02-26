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
var ogeSolarList;
var stripe=true;
var ogeDictionary=new Array;
var availableRecyclers;
var slots;
var slotsUsed;
var sendingFleet=null;
var debrisFields=new Array;
var sandglass={state:true,wait:true};
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
	var HTMLForm = '<form>'
		+ 'Search solar systems from ' 
		//TODO get input id = galaxy_input to read the checkIntInput(,,)
		+ '<input type="text" id="FPF_leftGalaxy" class="hideNumberSpin" style="width: 30px;" value="10" onkeyup="checkIntInput(this, 1, 10)">'
		+ '<input type="text" id="FPF_leftSS" class="hideNumberSpin" style="width: 30px;" value="200" onkeyup="checkIntInput(this, 1, 499)">'
		+ 'to'
		+ '<input type="text" id="FPF_rightGalaxy" class="hideNumberSpin" style="width: 30px;" value="10" onkeyup="checkIntInput(this, 1, 10)">'
		+ '<input type="text" id="FPF_rightSS"class="hideNumberSpin"  style="width: 30px;" value="210" onkeyup="checkIntInput(this, 1, 499)">'
		+ '<br/>'
		+ 'Search positions from'
		+ '<input type="text" id="FPF_closePosition" class="hideNumberSpin" style="width: 30px;" value="3" onkeyup="checkIntInput(this, 1, 15)">'
		+ 'to'
		+ '<input type="text" id="FPF_farPosition" class="hideNumberSpin" style="width: 30px;" value="6" onkeyup="checkIntInput(this, 1, 15)">'
		+ '<br/>'
		+'<a id="FPF_searchButton">Search</a>'
		+ '</form>';

	//TODO: correct this bloc
	var innerHTML=''
		+ '<div style="text-align:center;background:url('+chrome.extension.getURL('ressources/newsboxheader.gif')+') no-repeat;height:30px;">'
		+ '<span class="ogeBoxTitle">'+''+'</span>'
		+ '</div>'
		+ '<div id="FPFFormBox" style="padding:10px;background: url('+chrome.extension.getURL('ressources/frame_body.gif')+') repeat-y;">'+HTMLForm
		+ '<div id="SFDSendingFleets"></div>'
		+'</div>'
		+ '<div style="background: url('+chrome.extension.getURL('ressources/frame_footer.gif')+') no-repeat;height:30px;"></div>';
			
	var extDiv=document.createElement("div");
		extDiv.id = "FPFBox"
		extDiv.setAttribute("style","margin-left:10px;width:650px;background-color:#22313b");
		extDiv.innerHTML = innerHTML;

	document.getElementById("inhalt").appendChild(extDiv);


	/*var tmp=
	tmp.parentNode.(extDiv,tmp.parentNode.childNodes[2]);*/

	/*document.getElementById('ogeDFFSolarInput').addEventListener("keyup", GalaxyViewUpdate, false);
	
	document.getElementById('ogeDFFArrow1Left').onclick=OGEArrowClick;
	document.getElementById('ogeDFFArrow1Right').onclick=OGEArrowClick;
	document.getElementById('ogeDFFGalaxySearchClick').onclick=ogeDFFGalaxySearchClick;*/
	//GalaxyViewUpdate();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function GalaxyViewUpdate(){
	var g=GalaxyViewParse();
	document.getElementById('ogeDFFInfo').innerHTML=g.galaxyStr+': '+g.galaxy+' , '+g.solarStr+': '+g.solarStart+' - '+g.solarEnd;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function GalaxyViewParse(){
	var gvp=new Object();
	gvp.coords=document.getElementsByName('ogame-planet-coordinates')[0].getAttribute('content');
	gvp.radius=document.getElementById('ogeDFFSolarInput').value;
	gvp.galaxy=SmartCut(':'+gvp.coords,':',':');
	gvp.solar=SmartCut(gvp.coords,':',':');
	gvp.solarStart=gvp.solar*1-gvp.radius*1;
	gvp.solarEnd=gvp.solar*1+gvp.radius*1;
	gvp.solarStart=(gvp.solarStart<1)?1:(gvp.solarStart>499)?499:gvp.solarStart;
	gvp.solarEnd=(gvp.solarEnd<1)?1:(gvp.solarEnd>499)?499:gvp.solarEnd;
	gvp.galaxyStr=document.getElementById('galaxyscroll').childNodes[1].innerHTML;
	gvp.solarStr=document.getElementById('solarscroll').childNodes[1].innerHTML;
	return gvp;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function ogeDFFGalaxySearchClick(){
	sandglass.state=sandglass.wait=document.getElementById('ogeDFFGalaxyWaitButton').getAttribute('bs')==='true';
	var g=GalaxyViewParse();
	ogeDictionary['galaxy']=g.galaxyStr;
	ogeDictionary['sendRecyclerTo']=SmartCut(document.body.innerHTML,['case 600:','case 2:','"'],'"');
	ogeDictionary['fleetOnTheWay']=SmartCut(document.body.innerHTML,['case 600:','case 2:',"'title'","'"],"'");
	slots=parseInt(document.getElementById('slotValue').childNodes[2].nodeValue.match(/\d+/));
	slotsUsed=parseInt(document.getElementById('slotUsed').innerHTML);
	availableRecyclers=parseInt(document.getElementById('recyclerValue').innerHTML);
	
	InjectDFFView();
	
	ogeSolarList=new Array();
	for(var i=g.solarStart;i<=g.solarEnd;i++)
		ogeSolarList.push({galaxy:g.galaxy,solar:i});
		
	document.getElementById("ogeDFFWait").style.display='inline';
	DFFSearch('');
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function DFFSearch(txt){
	if(txt!=''){
		UpdateProgressBar();
		ParseTxt(ogeSolarList.shift(),txt);
	}
	
	if(ogeSolarList.length>0){
		var s=ogeSolarList[0];
		var fd='galaxy='+s.galaxy+'&system='+s.solar;
		if(sandglass.state&&sandglass.wait){
			sandglass.wait=false;
			setTimeout("DFFSearch('')",500+Math.floor(Math.random()*1000));
		}else{
			sandglass.wait=true;
			PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=galaxyCanLoad&ajax=1",fd,DFFSearchCanLoad);
		}
	}else{
		DFFSearchFinished();
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function DFFSearchCanLoad(txt){
	eval('var r=new Object('+txt+')');
	if(r.status){
		var s=ogeSolarList[0];
		var fd='galaxy='+s.galaxy+'&system='+s.solar;
		PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=galaxyContent&ajax=1",fd,DFFSearch);
	}else{
		DFFSearchFinished('error');
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function DocumentLocationFullPathname(){
	return document.location.protocol+'//'+document.location.host+document.location.pathname;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function UpdateProgressBar(){
	var tmp=document.getElementById("ogeDFFProgress");
	if(tmp) tmp.innerHTML=ogeSolarList.length;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function ParseTxt(s,txt){
	var t=txt.match(/id="debris\d+"[\s\S]+?<li><a/g);
	//Info('match > ',t);
	if(t){
		var debrisId;
		var crystal;
		var metal;
		var recycler;
		//var greenDerbisURL=chrome.extension.getURL('derbis-green.gif');
		for(var i=0;i<t.length;i++){
			debrisId=SmartCut(t[i],'id="debris','"');
			metal=SmartCut(t[i],['debris-content',':'],'<');
			crystal=SmartCut(t[i],['debris-content','debris-content',':'],'<');
			recycler=SmartCut(t[i],['debris-recyclers">',':'],'<');
			s.planet=debrisId;
			s.coord=s.galaxy+':'+s.solar+':'+s.planet;
			s.metal=metal;
			s.crystal=crystal;
			s.recycler=recycler;
			
			var newObj=JSON.parse(JSON.stringify(s));
			debrisFields.push(newObj);
			DebrisFieldDisplay(newObj);
		}
	}else{
		//Info('NO debris');
	}
	
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function DebrisFieldDisplay(df){
	var row=document.createElement("tr");
	row.innerHTML='<td class="ogeCenter">'+df.coord
		+'</td><td class="ogeRight">'+df.metal
		+'</td><td class="ogeRight">'+df.crystal
		+'</td><td class="ogeCenter">'+df.recycler
		+'</td><td class="ogeCenter">'
			+'<a title="'+ogeDictionary['galaxy']+': '+df.coord+'" target="_'+df.coord+'" href="'+DocumentLocationFullPathname()+'?page=galaxy&galaxy='+df.galaxy+'&system='+df.solar+'"><img src="'+chrome.extension.getURL('eye.gif')+'"></a>'
			+'<img title="'+ogeDictionary['sendRecyclerTo']+df.coord+'" style="margin-left:10px;cursor:pointer" src="'+chrome.extension.getURL('recycle.gif')+'" id="ogeSendRec'+df.coord+'">'
		+'</td>';
	row.setAttribute("class","ogeTableItem");
	if(stripe) row.setAttribute("class",row.getAttribute("class")+" rowStripe");
	stripe=!stripe;
	document.getElementById("ogeDFFTable").appendChild(row);
	
	df.img=document.getElementById("ogeSendRec"+df.coord);
	df.img.onclick=SendRecyclerOnClick;
	df.img.ogeDFData=df;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendRecyclerOnClick(sender){
	
	if(sendingFleet==null){
		sendingFleet=sender.srcElement.ogeDFData;
		sendingFleet.step=1;
		var img=sendingFleet.img;		
		sendingFleet.imgOnClick=img.onclick;
		sendingFleet.imgStyleCursor=img.style.cursor;
		sendingFleet.imgTitle=img.title;
		img.onclick=null;
		img.src=chrome.extension.getURL('loading.gif');
		img.style.cursor = '';
		img.title = '';
		PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet1",'',SendRecyclers);
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendRecyclers(response){
	var txt=SmartCut(response,'<body id="','"');
	var gsp='galaxy='+sendingFleet.galaxy+'&system='+sendingFleet.solar+'&position='+sendingFleet.planet;
	switch(txt)
	{
	case 'fleet1':
		if(sendingFleet.step==1){
			sendingFleet.step++;
			var fd=gsp+'&type=1&mission=0&speed=10&am209='+sendingFleet.recycler;
			PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet2",fd,SendRecyclers);			
		}else{SendRecyclersFailed()}
	break;
	case 'fleet2':
		if(sendingFleet.step==2){
			sendingFleet.step++;
			var fd='type=2&mission=0&union=0&am209='+sendingFleet.recycler+'&'+gsp+'&speed=10';
			PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=fleet3",fd,SendRecyclers);
		}else{SendRecyclersFailed()}
	break;
	case 'fleet3':
		if(sendingFleet.step==3){
			var token='&token='+SmartCut(response,["token'","='"],"'");
			
			sendingFleet.step++;
			var fd='holdingtime=1&expeditiontime=1&'+gsp+'&type=2&mission=8&union2=0&holdingOrExpTime=0&speed=10&am209='+sendingFleet.recycler+'&metal=0&crystal=0&deuterium=0';
			fd+=token;
			PostXMLHttpRequest(DocumentLocationFullPathname()+"?page=movement",fd,SendRecyclers);
		}else{SendRecyclersFailed()}
	break;
	case 'movement':
		if((sendingFleet.step==4)&&(response.indexOf('['+sendingFleet.coord+']')!=-1)){
			SendRecyclersSuccess();
		}else{SendRecyclersFailed()}
	break;
	default:
		SendRecyclersFailed()
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendRecyclersSuccess(){
	sendingFleet.img.src=chrome.extension.getURL('fleetyellow.gif');
	sendingFleet.img.title=ogeDictionary['fleetOnTheWay'];
	sendingFleet=null;
	//Info('SendRecyclersSuccess');
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function SendRecyclersFailed(){
	sendingFleet.img.src=chrome.extension.getURL('recycle-red.gif');
	sendingFleet.img.onclick=sendingFleet.imgOnClick;
	sendingFleet.img.style.cursor=sendingFleet.imgStyleCursor;
	sendingFleet.img.title=sendingFleet.imgTitle;
	sendingFleet=null;
	//Info('SendRecyclersFailed');	
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function DFFSearchFinished(result){
	document.getElementById("ogeDFFWait").style.display='none';
	document.getElementById("ogeDFFProgress").innerHTML='';
	if(result=='error'){
		//Info('DFFSearchFinished with error GALAXY CANNOT BE LOAD /deuter/');
		DFFError();
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function DFFError(){
	var errorMessage=SmartCut(document.body.innerHTML,['case 613',"'"],"'"); //deuterium needed
	var row=document.createElement("tr");
	row.innerHTML='<td class="ogeCenter" colspan="5">'+errorMessage+'</td>';
	row.setAttribute("class","ogeTableItem rowRed");
	document.getElementById("ogeDFFTable").appendChild(row);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function InjectDFFView(){
	var t;
	var coordsStr=document.getElementById("galaxyheadbg2").childNodes[1].innerHTML; //Planeta
	//var metalStr=document.getElementById("metal_box").getAttribute('title').match(/^[^:|]+/);
	//var crystalStr=document.getElementById("crystal_box").getAttribute('title').match(/^[^:|]+/);
	var metalStr=dict.GetWord('metal');
	var crystalStr=dict.GetWord('crystal');
	var recyclersStr=document.getElementById("recycler").childNodes[2].nodeValue.replace(/^\s+|\s+$/g,"");
	var actionStr=document.getElementById("galaxyheadbg2").childNodes[15].innerHTML;

	var tableHTML='<table id="ogeDFFTable" class="ogeTable" cellspacing="0" cellpadding="0" style="margin-top:20px;">'
		+ '<tr class="ogeTableItem ogeTableHeader">'
		+ '<td class="ogeColCrystal">'+coordsStr+'</td><td class="ogeColMetal">'+metalStr+'</td><td class="ogeColCrystal">'+crystalStr+'</td><td class="ogeColCrystal">'+recyclersStr+'</td><td class="ogeColCrystal">'+actionStr+'</td></tr>'
		+ '</table>';

		
	t='<div id="planet" style="height:250px;background-image:url('+chrome.extension.getURL('oge-probe-bg.jpg')+')">'
	+ '<div id="header_text"><h2>Debris Fields Finder</h2></div>'
	//+ '<div style="position:relative;top:50%;left:80%;"><img src="'+chrome.extension.getURL('wait-big.gif')+'"></div>'
	+ '</div>'
	+ '<div class="c-left" style="position:absolute;top:214px;"></div><div class="c-right" style="position:absolute;top:214px;"></div>'
	+ '<div style="margin-top:5px;text-align: center;background: url('+chrome.extension.getURL('frame_header.gif')+') no-repeat;height:30px;">'
	+ '<div class="ogeWindowHeader">'
	//+ '<span>Debris Fields</span>'
	+ '<span>&nbsp</span>'
	+ '<img id="ogeDFFWait" style="display: none;" src="'+chrome.extension.getURL('loading.gif')+'"><span id="ogeDFFProgress"></span>'
	+ '</div>'
	+ '<div id="ogeDFFContext" style="padding:20px;background: url('+chrome.extension.getURL('frame_body.gif')+') repeat-y;">'+    tableHTML        +'</div>'
	+ '<div style="background: url('+chrome.extension.getURL('frame_footer.gif')+') no-repeat;height:30px;"></div>';
	document.getElementById("inhalt").innerHTML=t;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function OGEArrowClick(sender){
	switch(sender.srcElement.id)
	{
	case 'ogeDFFArrow1Left':
		document.getElementById('ogeDFFSolarInput').value=parseInt(document.getElementById('ogeDFFSolarInput').value)-1;
		document.getElementById('ogeDFFSolarInput').onkeyup();
		GalaxyViewUpdate();
	break;
	case 'ogeDFFArrow1Right':
		document.getElementById('ogeDFFSolarInput').value=parseInt(document.getElementById('ogeDFFSolarInput').value)+1;
		document.getElementById('ogeDFFSolarInput').onkeyup();
		GalaxyViewUpdate();
	break;
	case 2:
	//execute code block 2
	break;
	default:
	//code to be executed if n is different from case 1 and 2
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