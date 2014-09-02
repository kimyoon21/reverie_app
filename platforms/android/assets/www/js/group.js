  	var _groups = [];
    var _groupData = {};	//그룹  json 데이터
    var _waitingList =[];
    
/********************************************
	 * 그룹리스트 페이지
 ********************************************/
$("#group_list").live("pageinit", function() {
	gfn_setTemplate("groupList");
	/** 가입.탈퇴.취소 버튼 처리 */
	$("#group_list #btn_join").tap(function() {
	  	var gid = $(this).attr("gid");
	  	var jtype = $(this).attr("jtype");
	  	var btn = $(this);
      fn_groupJoin(gid,jtype,btn);
		});

});

$("#group_list").live("pageshow", function() {
	if(gfn_checkSession())
		refreshGroupList();
});
/********************************************
	 * 그룹생성 페이지
 ********************************************/
$("#group_create").live("pageinit", function() {
		/** 글 저장 버튼 처리 */
	$("#group_create #btn_edit_save").tap(function() {
	  fn_saveGroup("create");   //수정 및 등록메소드
	});  
});

/********************************************
 * 정보수정페이지
 ********************************************/
$("#group_edit").live("pageinit", function() {
	gfn_setTemplate("waiting_list");
	
//	/** 글 저장 버튼 처리 */
//	$("#group_edit #btn_edit_save").tap(function() {
//	  fn_saveGroup("edit");   //수정 및 등록메소드
//	});
//	
//	$("#group_edit #btn_edit_delete").tap(function() {
//	  fn_deleteGroup("edit");   //수정 및 등록메소드
//	});  
	
	$("#group_edit #list_approve").tap(function() {
   	var gid = $("#group_edit #gid").val();
 	var uid = $(this).attr("uid");
   
    fn_approve(gid,uid,appList,appText);   //수정 및 등록메소드
	}); 
});

$("#group_edit").live("pageshow", function() {
	gfn_drawForm("#group_form",_groupData);
	//댓글 그리기
	gfn_drawList("#group_edit #waiting_list","waiting_list",_waitingList);
});

//그룹리스트로 넘어오기
function goToGroupList(){
	$.mobile.changePage('html/group/list.html');
}

function refreshGroupList(){
	var param = {userId:gv_sessionId};
	
	gfn_ajax("group/list.php",param).then(function(data){

		var groupList = data.groupList;
		
		var appStat = '';
		for(var i=0 ; i< groupList.length ; i++){
			appStat = groupList[i].applyStat;
			if(appStat == 'N')
				groupList[i].appBtnText = "취소";
			  else if(appStat == 'Y')
				groupList[i].appBtnText = "탈퇴";
			  else 
				groupList[i].appBtnText = "가입신청";
		}
		
		gfn_drawList('#group_list #groupList','groupList',groupList);
		
	});
}

/**
 * 게시판 그룹선택 팝업리스트 불러오기
 */
var refreshGroupPopup = function(){
	var param = {sessionId:gv_sessionId};
	
	gfn_ajax("group/popup.php",param).then(function(data){
		var groupList = data.groupList;
		var html ="";
		$("#group_list_popup").empty();
		for(var i=0; i < groupList.length ; i++){
			html = '<li><a onclick="changeBoardGroup(\''+groupList[i].groupId+'\',\'' + groupList[i].groupName+'\')">'+groupList[i].groupName+'</a></li>';
			$("#group_list_popup").append(html);
		}
		$("#group_list_popup").listview('refresh');
	});
}

//그룹관리 페이지 가기
function goToGroupEdit(groupId){
	var param = {
			"groupId":groupId
	};
	gfn_ajax('group/edit.php',param).then(function (data) {
		_groupData = data.groupData;
		_waitingList = data.waitingList;
		if(gfn_isNull(_waitingList)){
			_waitingList = [];
		}
		if(!gfn_isNull(data)){
			//그룹관리 페이지로 이동
			$.mobile.changePage('edit.html');
		}
		
	});
}
//그룹게시글 보기
function goToBoardPage(element){
	var groupId = $(element).parent().parent().attr('id');
	var groupName = $(element).parent().parent().attr('name');
	//게시글 페이지로 이동
	$.mobile.changePage('../../index.html');
	$.mobile.changePage('#board_page',changeBoardGroup(groupId,groupName));
	//게시판 이니셜 안됫을 경우 타이밍 안맞아세 에러. 추후다시
}
function refreshGroups(){
	
}

function fn_approve(groupId,userId,element){
	
	 var appList = $(element).parents("li");
	 console.log(appList.html());
    var appText = $(element).children("#app_text");
    
    var param = {
    		  "groupId"    : groupId,
			  "userId"    : userId
    }
    
    gfn_ajax('group/join_ok.php',param).then(function (data) {
		if(data != null){
 		
			console.log(userId + " 가입승인" + data.result);
	        appText.text("승인완료");
	        appList.slideToggle("slow");
		}
    });
	        
}

function goToJoin(groupId,btn){
  
     var typeNm = "";
     var postValue="";  // 적용후 버튼이름
     var postType="";
     var jtype = "";
     var applyStat = $(btn).attr('stat');
     // 기승인시 탈퇴, 미승인시 취소, 미신청시 가입신청
     if(applyStat == 'Y')
    	 jtype = "out";
     else if(applyStat == 'N')
    	 jtype = "cancle";
     else
    	 jtype = "join";
     
     
     
      if(jtype == "join"){   //가입신청
        typeNm = "가입신청";
        postValue = "취소"; 
        postStat = "N";
      }else	if(jtype == "cancle"){   //취소신청
        typeNm = "가입취소";
        postValue = "가입"; 
        postStat = "";
      }else if(jtype == "out"){   //탈퇴신청
	      typeNm = "탈퇴신청";
	      postValue = "가입";
	      postStat = "X"; 
	    }
  //컨펌창 추가
      
      var param = {
			  "groupId"    : groupId,
			  "sessionId" : gv_sessionId,
			  "type": jtype
			 };
      
  	gfn_ajax('group/join_ok.php',param).then(function (data) {
		if(data.result != null){
			console.log("로그 : "+data.result);
			alert(typeNm + " 되었습니다.");
			$(btn).changeButtonText(postValue);
			$(btn).attr('stat',postStat);
		}
  	});
  
	        
}

function fn_saveGroup(mode) {
      var page;
      var postUrl;
      if(mode == "edit"){ //수정
        page = "#group_edit ";
        postUrl = "edit_ok.php"; 
      }else{  //등록reg
        page = "#group_create ";
        postUrl = "create_ok.php"; 
      }
		
			var gid	= $(page+"#gid");
			var uid	= $(page+"#uid");
			var grpnm		= $(page+"#grpnm");
			var scryn   = $(page+"#scryn");
			var admuid   = $(page+"#admuid");
		  var grptxt		= $(page+"#grptxt");

			if (!grpnm.val()) {
				gfn_alert("require","그룹이름");
				grpnm.focus();
				return false;
			}
			if (!grptxt.val()) {
				gfn_alert("insert","그룹소개");
				grptxt.focus();
				return false;
			}
			if (!admuid.val()) {
				gfn_alert("require","관리자");
				admuid.focus();
				return false;
			}
			
			//ajax 연동 저장실행
			$.ajax({
				url: postUrl,
				type: "post",
				data : {
				  "gid"    : gid.val(),
				  "grpnm": grpnm.val(),
				  "scryn": scryn.val(),
				  "admuid": admuid.val(),
				  "grptxt" : grptxt.val()
				},
				dataType: "json",
				timeout: 30000,
				success: function(json) {
				  alert(json.gid + " 그룹정보가 저장되었습니다.");
					console.log("로그 : "+json.log);
					
					$.mobile.changePage("list.php", {
						data : {
							"gid": json.gid
						},
						reverse: true,
						changeHash : false
					});
				},
				error: function(xhr, textStatus, errorThrown) {
					alert("정보수정에 실패했습니다.\n" + textStatus + " (HTTP-" + xhr.status + " / " + errorThrown + ")");
				}
    });
}

function fn_deleteGroup(gid) {
	$.ajax({
		url: "delete_ok.php",
		type: "post",
		data : "gid=" + gid,
		dataType: "json",
		timeout: 30000,
		success: function(json) {
			var gid = $("#group_view #gid").val();
			$.mobile.changePage("list.php", {
				data: {"gid":gid},
				reverse: true,
				changeHash : false
			});
		},
		error: function(xhr, textStatus, errorThrown) {
			alert("글 삭제에 실패했습니다.\n" + textStatus + " (HTTP-" + xhr.status + " / " + errorThrown + ")");
		}
	});
}
