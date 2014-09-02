var _users = [];
var _userData = {};	//사용자  json 데이터
var _userGroupId = '0000'	// 회원목록을 보고자 하는 그룹아이디

/********************************************
 * 로그인페이지 시작
 ********************************************/
$("#user_login").live("pageinit", function() {
	if(!gfn_isNull(gv_sessionId)){
		$("#loginid").val(gv_sessionId);
		$("#loginout").text("로그아웃");
	}else{
		$("#loginid").val("");
		$("#loginout").text("로그인");
	}
});

$("#user_reg").live("pageshow", function() {
	
	if(gfn_isNull(_userData)){
		//등록
		$("#register_button",this).changeButtonText("등록");
		$("#pass_label").text("비밀번호");
	}else{
		$("#register_button",this).changeButtonText("수정");
		//보기 혹은 수정
		getUserData(gv_sessionId);
		$("#userId").attr("disabled",true);
		$("#userName").attr("disabled",true);
		$("#pass_label").text("신규 비밀번호(변경원할시)");
		
	}
});

$("#user_page").live("pageinit", function() {
	gfn_setTemplate("user_list");
});
$("#user_page").live("pageshow", function() {
	console.log("%%%%%%%%%%%%%%"+location.href);
	//세션 잇을때만 실행
	if(gfn_checkSession())
		refreshUserList(_userGroupId);
});

$("#user_room").live("pageshow", function() {
	//타이틀
	$("#user_room h1").text(_userData.userName + "의 방");
	//메뉴패널
	$("#popupPanel").on({
	    popupbeforeposition: function() {
	        var h = $( window ).height();

	        $( "#popupPanel" ).css( "height", h );
	    }
	});


});


var loginout = function(){
	if(!gfn_isNull(gv_sessionId)){
		//로그인 되어있을 경우 -> 로그아웃
		logout();
	}else{
		login();
	}
};

var login = function(){
	var id = $("#loginid").val();
	var pw = $("#loginpw").val();
	
	if(gfn_isNull(id+pw)){
		alert("필수입력항목입니다");
		return;
	}
	// push notification device id 등록
	var devId = window.localStorage.getItem("DEV_ID");
	// 푸쉬 등록아이디 받는데 시간이 5-10초 걸리므로 없을 경우  재시도
//	if(gfn_isNull(devId)){
//		window.localStorage.setItem("DEV_ID","unregisterd");	// 무한 재시도를 막기위해  디폴트값 넣어준다. 5초안에 제대로 받기를 기원하면서 ㅜ
//		console.log("현제 세션 저장된 디바이스 푸쉬 아이디 : "+devId);
//		alert("공지용 아이디 등록중입니다. 5초 후 다시 로그인해주세요.");
//		return;
//	}else if(devId == "unregisterd"){
//		devId = null;
//		alert("공지용 디바이스 아이디 등록에 실패했습니다. 사용 후 재로그인해주세요.");
//	}
	
	var param = {
			"userId":id,
			"userPw":pw,
			"devId":devId
	};
	console.log(JSON.stringify(param));
	gfn_ajax('user/login_ok.php',param).then(function(data){
		  if(!gfn_isNull(data.userName)){
		  	alert(data.userName+"님 로그인되었습니다.");
			//로컬 session 이용해서 정보 저장
		  	gfn_saveSessionData(data);
		   	if(!gfn_isNull(devId))
		   		window.localStorage.setItem("DEV_REGISTERED","true");
		   	$.mobile.changePage('../../index.html');
		   	refreshNotices();
		  }else{	//로그인 실패
			  alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요");
		  }
	});
}

var logout = function(){
	//글로벌 밸류 삭제 후 리프레쉬
	gfn_removeSessionData();
	console.log("로그인화면으로"); 
	$.mobile.changePage('html/user/login.html',{
		allowSamePageTransition : true
	});
};

function saveSession(userId,userName){
	//세션세이브
	localStorage.setItem("SSO_ID",userId);
	gv_sessionId = userId;
	localStorage.setItem("SSO_NAME",userName);
	gv_sessionName = userName;
	// 로컬스토리지에 세이브하고 파일에도 없으면 파일도 세이브
}
function deleteSession(userId){
	//세션세이브
	localStorage.removeItem("SSO_ID");
	gv_sessionId = null;
	localStorage.removeItem("SSO_NAME");
	gv_sessionName = null;
	
	// 로컬스토리지에 세이브하고 파일에도 없으면 파일도 세이브
}

/**
 * 사용자 정보 획득 메소드
 */

//회원목록 불러오기
var refreshUserList = function(groupId){
	var param = {'groupId':groupId};
	//현재 그룹에 해당하는 회원목록을 불러온다.
	gfn_ajax("user/list.php",param).then(function(data){
		if(!gfn_isNull(data.userList)){
			_users = data.userList;
			console.log(groupId +" 그룹 사용자목록 불러오기");
		}
		var myData =[];
		
		//타이틀변경
		$("#user_page h1").text(data.groupName + " ("+_users.length+"명)");
		
		//본인 데이터 제외하기
		for(var i=0; i< _users.length ; i++){
			if(_users[i].userId == gv_sessionId){
				myData.push(_users[i]);
				_users.splice(i,1);
				break;
			}
		}

		 //그리기
        gfn_drawList("#user_list","user_list",_users);
    	$("#user_list").prepend('<li data-role="list-divider">레버러</li>');
        //본인데이터 추가
        gfn_drawList("#user_list","user_list",myData,true,true);
        $("#user_list").prepend('<li data-role="list-divider">나</li>');
        $("#user_list").listview('refresh');
        _users.push(myData[0]);
	});
};

var getUserData = function(userId){
	var param = {'userId':userId};
	gfn_ajax("user/get.php",param).then(function(data){
		data = data.userData;
		  if(!gfn_isNull(data.userName)){
			  _userData = data;
			  
			  gfn_drawForm("#user_reg",_userData);
		  }else{	//불러오기 실패
			  alert("불러오기 실패했습니다 ㅜ");
		  }
	});
};

var userSave = function(){
	if($("#userPwChk").val() != $("#userPw").val()){
		alert("비밀번호 확인값이 일치하지 않습니다.");
		return;
	}
	
	var formData = gfn_getFormData("#user_reg");
	if(formData == false) return;
	//전체학번에서 2자리 학번 추출
	formData.userGrade = formData.userId.substr(1,2);

	
	// push notification device id 등록
	var devId = window.localStorage.getItem("DEV_ID");
	formData.devId = devId;
	
	if(gfn_isNull(_userData)){//등록
		gfn_ajax("user/reg_ok.php",formData).then(function(data){
			 if(!gfn_isNull(data.result)){//가입 실패
				 if(data.result == "registered"){
					 alert("이미 등록된 학번입니다.");
				 }else{
					 alert(data.userName+"님 가입 되었습니다.");
					 //로컬 session 이용해서 로그인 정보저장
					 $.mobile.changePage('../../index.html');
				 }
			  }else{	//가입 실패
				  alert("회원가입에 실패했습니다 ㅜ");
			  }
		});
	}else{	///수정
		_formData = formData;
		$("#popupPassWd").popup("open");
	}

};
var _formData;

function editUser(){
	$("#popupPassWd").popup("close");
	_formData.oldPw = $("#popupPassWd #oldPassWd").val();
	console.log(JSON.stringify(_formData));
	gfn_ajax("user/edit_ok.php",_formData).then(function(data){
		 if(!gfn_isNull(data.result)){
			 
			  	alert(gv_sessionName+"님 정보가 수정되었습니다.");
				//로컬 session 이용해서 로그인 정보저장
                $.mobile.changePage('../../index.html');
                
		  }else{	//가입 실패
			  alert("정보 수정에 실패했습니다. 다시 확인해주세요");
		  }
	});
}


var goToUserList = function(groupId){
	_userGroupId = groupId;
	$.mobile.changePage(ROOT_URL+'html/user/list.html');
	
};

var goToUserReg = function(){
	_userData = null;
	$.mobile.changePage('reg.html');
};
//내정보 보기(수정)
var goToMyData = function(){
	goToUserData(gv_sessionId);
};

var goToUserData = function(userId){
	//회원정보 수정
	_userData.userId = userId;
	$.mobile.changePage('html/user/reg.html');
};

var goToUserRoom = function(userId){
	var userIndex = gfn_findJsonIndex(_users,'userId',userId);
	_userData = _users[userIndex];
	console.log(JSON.stringify(_userData));
	$.mobile.changePage('room.html');
};


