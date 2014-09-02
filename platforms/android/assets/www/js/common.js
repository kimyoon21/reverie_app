var gv_version = 123;

var gv_sessionId = "";
var gv_sessionName = "";
var gv_groupId = "";
var gv_groupName = "";

var ROOT_URL = "/android_asset/www/";
var root_dir = "http://www.foreverie.co.kr/";

$(document).live("mobileinit", function() {

	/********************************************
	 * 기본 환경설정
	 ********************************************/
	$.support.cors = true;
	
	$.extend($.mobile, {
		defaultPageTransition: "none",
		defaultDialogTransition: "pop",
		loadingMessage: "페이지 로딩중입니다...",
		loadingMessageTextVisible: true,
		loadingMessageTheme: "a",
		pageLoadErrorMessage: "페이지를 불러올 수 없습니다.",
		pageLoadErrorMessageTheme: "e",
		allowCrossDomainPages: true
	});

});

//메뉴 그리기
$(document).ready(function(){
	
	
	//로컬세션에 등록된 아이디를 찾아보고 없는 경우 로그인시킨다.
	gfn_loadSessionData();
	gv_groupId = '0000';
	$("#navigation a").each(function(){
		var menuNo = $(this).attr("id");
		var menuName ="";
		if(menuNo == 'menu1'){
			menuName = '뉴스';
		}else if(menuNo == 'menu2'){
			menuName = '게시판';
		}else if(menuNo == 'menu3'){
			menuName = '창고';
		}else{
			menuName = '기타등등';
		}
		$(this).text(menuName);
		$(this).tap(function(){
			gfn_goToMenu(this);
		});
	});
});

/**
 * 버전체크
 */
function gfn_checkVersion(){
	var param = null;
	gfn_ajax("version.php",param).then(function(data){
		console.log(data.version);
		if(parseInt(data.version) > gv_version){
			alert("최신버전이 아닙니다. 업데이트 해주세요");
			window.location.href = "https://play.google.com/store/apps/details?id=com.foreverie.app";
		}else{
			console.log("최신버전입니다");
		}
	
	});
}
/********************************************
 * 공지(시작) 페이지 시작
 ********************************************/
$("#news_page").live("pageinit", function() {

	gfn_setTemplate("feed_list");
	//버전체크부터
	gfn_checkVersion();
	
	console.log("ㅅㅣ작페이지 초기화 & 세션아이디 : "+gv_sessionId);
	
//	gfn_checkSession('index');

	refreshNotices();
	gfn_setTemplate("board_list");
	
});
	

/********************************************
 * 공통함수
 gfn_alert(메시지아이디, 메시지에서 변경될 글자);
 ********************************************/
function gfn_checkSession(currentPage){
	if(gfn_isNull(gv_sessionId)){
		console.log("***********세션없음");
		var page;
//		if(currentPage == 'index') page='html/user/login.html';
//		else 					   page='../user/login.html';
		page='html/user/login.html';
		$.mobile.changePage(page,{
			changeHash:false
		});
		return false;
	}else{
		return true;
	}
}

function gfn_alert(msgid,param){

  var msg;
  if(msgid == "insert"){
    msg = "를(을) 입력하시기 바랍니다.";
  }else if(msgid == "require"){
    msg = "은(는) 필수항목 입니다.";
  }else if(msgid == "cant"){
    msg = "은(는) 불가능합니다.";
  }else if(msgid == "user"){
    msg = "";
  }
  
  alert(param+msg);
}


/********************************************
* 공통함수
 gfn_loadSessionData();  세션에 저장된 로그인정보 를 돌려주고 없을 경우 null
********************************************/
function gfn_loadSessionData(){
	//세션에 JSON형태로 저장되있는 로그인 유저와 이름빼오기
	var sessionJson = window.localStorage.getItem("SSO_DATA");
	sessionJson = JSON.parse(sessionJson);
	if(gfn_isNull(sessionJson)){
		return null;
	}else{
		gv_sessionId = sessionJson.userId;
		gv_sessionName = sessionJson.userName;
		console.log(gv_sessionId+" 아이디획득");	
	}
}
//저장메소드
function gfn_saveSessionData(data){
	gv_sessionId = data.userId;
	gv_sessionName = data.userName;
	var sessionJson = JSON.stringify(data);
	window.localStorage.setItem("SSO_DATA",sessionJson);
}

//삭제메소드
function gfn_removeSessionData(data){
	gv_sessionId = null;
	gv_sessionName = null;
	window.localStorage.removeItem("SSO_DATA");
}

/******************************************************
 *  null값 undefined , 빈스트링인지 확인해주는 공통함수
 * @param data
 * @returns {Boolean}
 *****************************************************/
function gfn_isNull(data){
	if(data == null || data == undefined) return true;
	if(data == "" || data =="null" || data=="undefined") return true;
	if(data == 'NAN') return true;
	//위 모든 사항이 아니면 빈값이 아니므로 false
	return false;
}

/******************************************************
 * 지정된 자릿수에서 반올림하는 함수
 * @param Num, Position , Base
 * @returns {int}
 *****************************************************/
function Round(Num, Position , Base){
    //Num = 반올림할 수
    //Position = 반올림할 자릿수(정수로만)
    //Base = i 이면 소숫점위의 자릿수에서, f 이면 소숫점아래의 자릿수에서 반올림
	
	if(Position == 0){ 
	            //1이면 소숫점1 자리에서 반올림
	    return Math.round(Num); 
	}else if(Position > 0){
	    var cipher = '1';
	    for(var i=0; i < Position; i++ )
	                    cipher = cipher + '0';
	
	    var no = Number(cipher);
	
	    if(Base=="i"){
	    	//소숫점위에서 반올림.                        
            return Math.round(Num / no) * no;   
	    }else{
	          //소숫점아래에서 반올림                        
	        return Math.round(Num * no) / no;
	    }
     }else{
        alert("자릿수는 정수로만 구분합니다.");
        return false;
     }
}



/**
 *  날짜 밸리데이션
 */
function gfn_isValidDate(s) {
	  var bits = s.split('-');
	  var y = bits[0], m  = bits[1], d = bits[2];
	  // Assume not leap year by default (note zero index for Jan)
	  var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
	
	  // If evenly divisible by 4 and not evenly divisible by 100,
	  // or is evenly divisible by 400, then a leap year
	  if ( (!(y % 4) && y % 100) || !(y % 400)) {
	    daysInMonth[1] = 29;
	  }
	  return (d > 0 && d <= daysInMonth[--m]);
}

function gfn_back(){
	history.go(-1);
}

//메뉴 네비게이션
function gfn_goToMenu(menu){
	var menuId = $(menu).attr("id");
	var nextPageId = "";
	if(menuId == "menu1"){
		nextPageId = "#news_page";
	}else if(menuId == "menu2"){
		nextPageId = "#board_page";
	}else if(menuId == "menu3"){
		nextPageId = "#link_page";
	}else if(menuId == "menu4"){
		nextPageId = "#plus_page";
	}
	
	$.mobile.changePage(nextPageId);
	$(nextPageId+" #navigation a").removeClass("ui-btn-active");
	$(nextPageId+" #"+menuId).addClass("ui-btn-active");
};

/**
 *	 ajax 통신등의 상황에서 화면에 로딩이미지를 띄워서 사용자의 작동을 방지한다.
 * 
 */
var waitForCursor = (function () {
	var loadingCnt = 0;
	return function (isStart) {
		
		//로딩 시작 카운트와 종료카운트
	    if (isStart == true) {
	    	loadingCnt++;
	    }else if(isStart== false){	//취소일경우
	    	if(loadingCnt == 0){
	    		//이미 모든 트랜잭션 취소된
	    		return;
	    	}else{
	    		// 트랜잭션 취소(화면에선 취소로 보이지만 실제론 진행중)
	    		loadingCnt--;
	    	}
	    	
	    }else if(isStart =="stop"){
	    	// 트랜잭션 모두 취소(화면에선 취소로 보이지만 실제론 진행중)
    		loadingCnt = 0;
    		isStart = false;
	    }
	    
	    
	    //로딩시작하는 경우-> 커서동작 -> 마우스 억제
	    if (isStart==true && loadingCnt == 1) {
	    	$.mobile.loading('show');
	    }else if(isStart == false && loadingCnt ==0){
	    	$.mobile.loading('hide');
	    }
	    
	};
})();



function gfn_ajax(url,param){
	var server_addr= 'http://www.neogarden.co.kr/kimyoon/reverie_app_server/';
	var local_addr =  'http://localhost/kimyoon/reverie_app_server/';
	console.log("##### "+url+" 통신 "+JSON.stringify(param));
	waitForCursor(true);
	 return $.ajax({
           	url:server_addr+url,
               type : 'post',
               async : true,
               cache : false,
               dataType:"json",
               data: param,
               crossDomain:true
              
           }).success(function (data) {
        	   console.log("*******데이터 트랜잭션 성공");
        	   waitForCursor(false);
               console.log(JSON.stringify(data));
               return data;
      		}).error(function(xhr,status){
      			 waitForCursor(false);
      			console.log("###### 트랜잭션 실패 #####");
      			console.log(xhr.status + " " +status);
      		});
	
}
//추후 정규표현식으로 바꿔보자
function gfn_drawList(listSelector,listId,data,isAdd,isPrepend){
	
	//실제 페이지에 있는 template 을 pageinit 때 등록
	// 등록 후 찾아서 사용
	template = gfn_getTemplate(listId);
	if(gfn_isNull(template)){
		console.log(listSelector + " 에 해당하는 템플릿 없음");
		return;
	}
	
	//추가인 경우에는 기존리스트 엠티 안함
	if(isAdd != true){
		$(listSelector).empty();
	}
	
	if(gfn_isNull(data)) {
		
		$(listSelector).append("<span> 목록이 비어있습니다  </span>");
		return;
	}
	//불러온 템플릿에 파라미터들을 매칭한다.
	for(var i = 0 ; i < data.length ; i++){

		//json 데이터에 히든 true 일경우
		if(data[i]["hidden"] == true){
			//임시
			continue;
		}
		var templatePart = template.split("{{");
		var itemHTML = templatePart[0];
		// {{ 기준으로 분리 , 0번째 부분은 앵귤러 변수가 아님으로 저장만 하고 넘어감
		for(var j=1 ; j < templatePart.length ; j ++){
			var templatePart2 =templatePart[j].split("}}"); 
			var bindName = templatePart2[0];
			//console.log(bindName + " : "+ data[i][bindName]);
			var bindValue = "";
			if(!gfn_isNull(data[i][bindName])){
				bindValue = data[i][bindName];
			}else{
				bindValue = "&nbsp";	//자료 없을땐 공백입력
			}
			itemHTML += bindValue + templatePart2[1];
		}
		
		//앞에 추가할지 뒤에 추가할지
		if(isPrepend == true){
			$(listSelector).prepend(itemHTML);
		}else{
			$(listSelector).append(itemHTML);
		}
	}
	$(listSelector).listview('refresh');
}

//폼그리기
function gfn_drawForm(formSelector,data){
	console.log("폼그리기 시작");
	if($(formSelector) == null){
		console.log("폼 선택 실패 : " + formSelector);
		return;
	}
	var elementId = "";
	//input
	$(formSelector).find("input").each(function(){
		elementId = $(this).attr("id");
		$(this).val(data[elementId]);
		console.log(data[elementId]);
	});
	//textarea
	$(formSelector).find("textarea").each(function(){
		elementId = $(this).attr("id");
		$(this).text(data[elementId]);
	});
	//select
	$(formSelector).find("select").each(function(){
		elementId = $(this).attr("id");
		var selectedValue = data[elementId];
		$(this).find("option[value="+selectedValue+"]").attr("selected", true);
	});

}

//폼읽기
function gfn_getFormData(formSelector){
	var elementId = "";
	var data = {};
	var goingOn = true;
	//input
	$(formSelector).find("input").each(function(){
		elementId = $(this).attr("id");
		data[elementId] = $(this).val();
		//console.log($(this).attr("required"));
		//필수값 확인
		if($(this).attr("required") == "required" && gfn_isNull(data[elementId]) ){
			alert($(this).attr("placeholder"));
			goingOn = false;
			return false;
		}
	});
	if(goingOn == false)return false;
	//textarea
	$(formSelector).find("textarea").each(function(){
		elementId = $(this).attr("id");
		data[elementId] = $(this).val();
	});
	//select
	$(formSelector).find("select").each(function(){
		elementId = $(this).attr("id");
		data[elementId] = $(this).find("option:selected").attr("value");
	});

	console.log(JSON.stringify(data));
	return data;
}

/**
 * 닫기버튼 누르면 페어런트 닫아짐
 * @param element
 */
function gfn_closeParent(element){
	$(element).parent().toggleClass('hidden');
}

/**
 * 버튼 텍스트 체인지
 */
(function($) {
    /*
     * Changes the displayed text for a jquery mobile button.
     * Encapsulates the idiosyncracies of how jquery re-arranges the DOM
     * to display a button for either an <a> link or <input type="button">
     */
    $.fn.changeButtonText = function(newText) {
        return this.each(function() {
            $this = $(this);
            if( $this.is('a') ) {
                $('span.ui-btn-text',$this).text(newText);
                return;
            }
            if( $this.is('input') ) {
                $this.val(newText);
                // go up the tree
                var ctx = $this.closest('.ui-btn');
                $('span.ui-btn-text',ctx).text(newText);
                return;
            }
        });
    };
})(jQuery);

/**
 * 리스트 항목 추가
 */
(function($) {
    /*
     * Changes the displayed text for a jquery mobile button.
     * Encapsulates the idiosyncracies of how jquery re-arranges the DOM
     * to display a button for either an <a> link or <input type="button">
     */
    $.fn.addRow = function(child,isValueCopy) {
            if( $(this).attr("data-role")=="listview") {
            	var curRow;
            	//특정 로우뒤에 추가가 아닌 경우 가장 아래 신규 로우 추가
            	if(gfn_isNull($(child))){
            		curRow = $(this).find("li:first-child");
            	}else{	//특정 로우 뒤에 추가
            		curRow = $(child).closest('.ui-li');
            	}
            	
            	var newRow = curRow.clone();
            	//밸류도 복사하는 경우 아니면 초기화
            	if(isValueCopy != true){
            		newRow.find(":input").val("");
            	}
            	curRow.after(newRow);
            	$(this).listview('refresh');
            	return;
            }
        
    };
})(jQuery);

/***
 * 검색함수
 * json list 에서 특정 항목에 해당 값 찾아서 index return
 * 
 */
function gfn_findJsonIndex(jsonList,column,value){
	if(jsonList.length < 1){
		console.log("리스트의 크기가 0입니다");return;
	}else if(jsonList[0][column] == undefined){
		console.log("해당 컬럼이 존재하지 않습니다.");return;
	}else{
		console.log(jsonList.length +"개의 리스트 중 " +column + " 에서 "+value+" 를 검색합니다!!!!!");
	}
	
	for(var i = 0 ; i < jsonList.length ; i++){
		//console.log(jsonList[i][column]);
		if(jsonList[i][column] == value){
			return i;
		}
	}
	
	console.log("대상을 찾지 못하였습니다ㅜㅜㅜㅜㅜㅜㅜㅜㅜㅜㅜㅜ");
	return -1;
}
