/// GLOBALS ///
var moduleDomId='OGE News';
//////////////////////////////////////////////////////////////////////////////////////////////////////
if(! IsModuleLoaded(moduleDomId,true)){
	Info('ITP OGE News [LOADED]');

	if(document.location.href.indexOf('page=overview')!=-1){
		if(IsModuleLoaded('OGE Center',false)){ //temporary solution to allow OGE News exist
			OGENewsInjectionReplace();
		}else{
			OGENewsInjection();
		}
		OGENewsShow();
	}
	
	if(IsNewSession(moduleDomId,true)){
		PostXMLHttpRequest("http://oge.i4app.com/news/news.php",'uni='+document.getElementsByName('ogame-universe')[0].getAttribute('content')+'&pid='+document.getElementsByName('ogame-player-id')[0].getAttribute('content'),OGENewsUpdateReceived);
	}else{
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
function IsModuleLoaded(_moduleDomId,_add){
	var modules=document.head.getElementsByClassName("oge-loaded-module"), result=false;
	for(var i=0;i<modules.length;i++){
		if(modules[i].getAttribute("content")==_moduleDomId) {result=true;break}
	}
	if(_add){
		var flag=document.createElement("meta");
		flag.setAttribute("class","oge-loaded-module");
		flag.setAttribute("content",_moduleDomId);
		document.head.appendChild(flag);
	}
	return result;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function IsNewSession(_moduleDomId,_add){
	var session=document.getElementsByName('ogame-session')[0].getAttribute('content'), result=false;
	if(localStorage.session!=session){
		if(_add){localStorage.session=session; localStorage.sessionModules=_moduleDomId+','};
		result=true;
	}else{
		if(typeof(localStorage.sessionModules)=="undefined") localStorage.sessionModules='';
		if(localStorage.sessionModules.indexOf(_moduleDomId)==-1){
			if(_add)localStorage.sessionModules+=_moduleDomId+',';
			result=true;
		}
	}
	return result;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function OGENewsUpdateReceived(_response){
	var news=JSON.parse(_response);
	if(news.html!='') localStorage.ogenews=news.html;
	OGENewsShow();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function OGENewsShow(){
	var handle=document.getElementById("ogeNewsContent");
	if(handle){
		if(typeof(localStorage.ogenews)=="undefined") localStorage.ogenews="OGE News server is offline :(<br><br>You can always check our <a href='http://oge.i4app.com' target='_blank'>forum</a>";
		handle.innerHTML=localStorage.ogenews;
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function OGENewsInjectionReplace(){
	var handle=document.getElementById("OGECenterContent");
	if(handle){
		handle.parentNode.childNodes[0].childNodes[0].innerHTML='OGE News';
		handle.id="ogeNewsContent";
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function OGENewsInjection(){
if(!document.getElementById("ogeNewsContent")){
	var box=''
	+ '<div style="text-align:center;background: url('+chrome.extension.getURL('newsboxheader.gif')+') no-repeat;height:30px;">'
	+ '<span style="color:#ffd700;font-family: Verdana, Arial, Helvetica, sans-serif;font-weight: bold;display:inline;line-height:30px;vertical-align: middle;">'
	+ 'OGE News'
	+ '</span></div>'
	+ '<div id="ogeNewsContent" style="padding:20px;background: url('+chrome.extension.getURL('frame_body.gif')+') repeat-y;text-align: left;"></div>'
	+ '<div style="background: url('+chrome.extension.getURL('frame_footer.gif')+') no-repeat;height:30px;"></div>';
	var boxDom=document.createElement("div");
	boxDom.setAttribute("style","margin:5px 0px;text-align:center;clear:both");
	boxDom.innerHTML=box;
	document.getElementById("inhalt").appendChild(boxDom);
}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function Info(text){
	var txt="";
	for( var i = 0; i < arguments.length; i++ ) txt+=arguments[i];
	console.log(txt);
};
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