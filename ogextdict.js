var moduleDomId='OGEXT Dictionary';
Info(moduleDomId+' [LOADED]');

var dict=new Object;

dict.words=JSON.parse(LoadJSONfromFile( chrome.extension.getURL("/dictionary/"+document.getElementsByName('ogame-language')[0].getAttribute('content')+".dict") ));
dict.GetWord=function(_word){return this.words[_word]||_word;};

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
      alert("Your browser does not support XMLHttpRequest.");
   }
   return xmlhttp;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
function LoadJSONfromFile(_filename){
	xmlhttp = getXmlHttp();
	xmlhttp.open("GET",_filename, false);
	xmlhttp.send();
	return xmlhttp.responseText;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////