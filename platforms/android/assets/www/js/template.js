/**
 * 사용법
 * 
 * drawList 실행시  템플릿을 찾아와서 데이터를 바인딩 한다.
 * 이때 템플릿 안에 있는  {{}} 형식의 매핑 레퍼런스는 알아서 데이터 안에 있는 JSON 에 바인딩 되도록 한다.
 * @param templateId
 * @returns
 */

var templateJson = {};

function gfn_getTemplate(templateId){
	console.log(JSON.stringify(templateId));
	return templateJson[templateId];
}

function gfn_setTemplate(tempId){
	templateJson[tempId] = $("#"+tempId).html();
	$("#"+tempId).empty();
}
