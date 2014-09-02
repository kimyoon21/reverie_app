
 	var _notices = [];
    var _boards = [];
    var _boardData = {};	//게시글  json 데이터
    var _noticeData = {};
    var _commentList = [];	//댓글리스트
    var _liked = "";	//본 게시글에 좋아요를 했는지 여부
    var _isNotice = true;
    var _isModify = false;
	
    var _voteData={};
    var _choiceList=[];
    var _votes =[];
	
/********************************************
 * 글 읽기 페이지 시작
 ********************************************/
$("#news_page").live("pageshow", function() {
	_isNotice = true;
	gfn_checkSession();
	

});
$("#board_page").live("pageshow", function() {
	_isNotice = false;
	gfn_checkSession();
	refreshGroupPopup();
});

$("#board_page").live("pageinit", function() {
//	gfn_setTemplate("board_list");
	if(gfn_isNull(_boards)){
		changeBoardGroup('0000','전체');
		console.log(gv_groupId); 
	}
	
});

$("#board_view").live("pageinit", function() {
	gfn_setTemplate("comment_list");
	
});
//뷰 페이지 새로고침 에러 방지 위해  엠티페이지 거쳐서 오도록 만들기
$("#board_empty").live("pageshow", function() {
	$.mobile.changePage('/android_asset/www/html/board/view.html',{
		changeHash:false
	});             
});

//뷰페이지 로딩 완료후
$("#board_view").live("pageshow", function() {
	$("#board_view #boardTitle").text(_boardData.boardTitle);
	//수정일시
	var chgText = gfn_isNull(_boardData.chgDate)?"":"수정일시:"+ _boardData.chgDate;
	var boardText = gfn_isNull(_boardData.boardText)?"&nbsp":_boardData.boardText;
	var boardContent =	"작성자: "+_boardData.regUserName+"<br/>\
	작성일시: "+ _boardData.regDate +"<br/>"+ chgText +"\
	<hr />"+	boardText;
	
	$("#board_view #boardContent").html(boardContent);
	//좋아요 그리기
	if(_liked == "liked"){	//이미 좋아요 된 상태
		$("#board_view #btn_like").toggleClass('liked');
	}else{
		//nothing
	}
	//댓글 그리기
	gfn_drawList("#board_view #comment_list","comment_list",_commentList);
});

//작성 및 수정
$("#board_write").live("pageshow", function() {
	//말머리 읽어오기
	var param = {"groupId":gv_groupId};
	
	gfn_ajax('board/header.php',param).then(function (data) {
		var headerList = data.headerList;
		var html = "";
		for(var i=0; i < headerList.length ; i++){
			html = '<option value="'+headerList[i].headerId+'">'+headerList[i].headerName+'</option>';
			$("#headerSelect").append(html);
		}
		
		//수정 /신규 분기
		if(_isModify == true){
			$("#board_write h1").text("수정하기");
			$("#headerSelect").val(_boardData.headerId);
			$("#boardTitle").val(_boardData.boardTitle);
			$("#boardText").text(_boardData.boardText);
		}
		$('#headerSelect').selectmenu("refresh");
		
	});
	
	
});


var changeBoardGroup = function(groupId,groupName){
	gv_groupId = groupId;
	gv_groupName = groupName;
	refreshBoards(groupId);	
	
	if(!gfn_isNull($("#groupPopup").popup()))
		$("#groupPopup").popup('close');
	$("#boardGroupName").text(groupName+" 게시판");
}

/**
 * 보드뷰페이지에서 리스트로 돌아갈때 공지인지 일반인지 확인
 */
var goToBoardList = function(){

	if(_isNotice == false){
		$.mobile.changePage('../../index.html');
		$.mobile.changePage('#board_page');
	}
	else{
		$.mobile.changePage('../../index.html');
		$.mobile.changePage('#news_page');
	}
}

var getBoard = function(boardNo,afterSave){
	var param = {"boardNo":boardNo,
			"sessionId":gv_sessionId};
	var hash=true;
	if(window.location.href == "file:///android_asset/www/html/board/view.html"){
		hash = false;
	}

	var url="/android_asset/www/html/board/view.html";
	
	
	gfn_ajax('board/get.php',param).then(function (data) {
		_boardData = data.boardData;
		_liked = data.liked;
		_commentList = data.commentList;
		
		if(gfn_isNull(_commentList)){
			_commentList = [];
		}
		//타입에 따른 분기
		if(_boardData.boardType == "vote"){
			getVote(boardNo,hash);
		}else{
			if(hash == true){
				$.mobile.changePage(url,{
					changeHash:true
				});	
			}else{
				$.mobile.changePage("/android_asset/www/html/board/empty.html",{
					changeHash:false
				});             
			}
			
		}
		
	});
};

var getVote = function(boardNo,hash){
	var param = {"boardNo":boardNo};
	
	gfn_ajax('board/vote_get.php',param).then(function (data) {
		_voteData = data.voteData;
		_choiceList = data.voteList;
		
		$.mobile.changePage('html/board/view.html',{
			changeHash:hash
		});
	});
}


var refreshBoards = function (groupId) {
	var param = {"groupId":groupId};
	gfn_ajax('board/list.php',param).then(function (data) {
    	var data = data.resultList;
        if (!data) {
            data = [];
        }
        _boards = data;
        
        //그리기
        gfn_drawList("#board_list","board_list",data);
    });
};

var refreshNotices = function () {
	var param = {"sessionId":gv_sessionId};
	gfn_ajax('board/notice_list.php',param).then(function (data) {
    	var data = data.resultList;
        if (!data) {
            data = [];
        }
        _notices = data;
        //그리기
        gfn_drawList("#feed_list","feed_list",data);
    });
};

var saveBoard = function () {

	//일반 게시판에서 저장할때는 스코프의 그룹아이디 사용
	var userId = gv_sessionId;
	//게시판타입결정
	//보통 일반("") ,하나만 잇을땐 그 타입(vote, photo, video, file), 2개이상이면 (mix)?????????
	var type ="";
	$(".attach_div").each(function(){
		if($(this).hasClass("hidden")){
			//히든이면 해당안됨
		}else{
			//히든 아닐때 이미 타입추가된게 없으면 해당 타입으로
			// 아니면 믹스
			if(gfn_isNull(type)){
				type = $(this).attr("type");
			}else{
				type = "mix";
			}
		}
	});
	var push = $("#board_write #pushYn").attr("checked")=="checked" ? 'Y' : 'N' ;
	var param = {
			"boardTitle": $("#board_write #boardTitle").val(),
			"boardText": $("#board_write #boardText").val(),
			"groupId": gv_groupId,
			"userId":userId,
			"headerId":$("#board_write #headerSelect").val(),
			"boardType":type,
			"pushYn": push
		}
	
   //수정 생성 분기
	if(gfn_isNull(_boardData.boardNo)){
		//신규 작성
		gfn_ajax('board/write_ok.php',param).then(function(data){
			//게시글 작성 성공시 신규 번호 획득
			boardNo = data.boardNo;
			refreshBoards(gv_groupId);
			
			//push notification 작동
			param.boardNo = boardNo;
			console.log(push);
			if(push == 'Y'){	//알람할때만
				gfn_ajax('board/push_ok.php',param).then(function(data){
					console.log("푸쉬알림 보내기 :"+data.result==null?"실패":"성공");
				});
			}
			
			if(type == 'vote'){
				gfn_ajax('board/vote_write_ok.php',param).then(function(data){
					//신규 게시글 뷰로 이동
					getBoard(data.boardNo,true);
				});
			}else{
				//신규 게시글 뷰로 이동
				getBoard(data.boardNo,true);
			}
			
			
		});
	}else{
		//수정
		param.boardNo = _boardData.boardNo;
		gfn_ajax('board/edit_ok.php',param).then(function(data){
			//게시글 뷰로 이동
			getBoard(data.boardNo,true);
		});
	}
};

//신규 글 작성 페이지
var goToWrite = function () {
	_boardData = {};		//데이터 초기화
	_isModify = false;
	$.mobile.changePage('html/board/write.html');
}

var goToModify = function () {

	if(_boardData.regUserId == gv_sessionId ){
		//본인 작성 게시글일시 수정가능
		$.mobile.changePage('write.html');
		_isModify = true;
	}else{
	//수정불가
		alert("본인글만 수정 가능");
	}
};

var writeComment = function(){
	//내용있을시에만 진행
	if($("#newCmtText").val()==''){
		return;
	}
	
	var param = {
			"userId":gv_sessionId,
			"workId":"insert",
			"boardNo":_boardData.boardNo,
			"commentText":$("#newCmtText").val()
	};
	gfn_ajax('board/comment_ok.php',param).then(function(data){
		
		//댓글 작성 성공시 신규 번호 획득
		param.commentNo = data.commentNo;
		param.userName = gv_sessionName;
		param.commentRegDate = "방금";
		//댓글리스트에 동적 추가
		_commentList.push(param);
		 //댓글 그리기
        gfn_drawList("#comment_list","comment_list",_commentList);
        //작성된 내용 지우기
        $("#newCmtText").val('');
		console.log(JSON.stringify(_commentList));
	});
}

var like = function(){
	var workId ="";
	if($("#board_view #btn_like").hasClass('liked')){
		workId = "unlike";
	}else{
		workId = "like";
	}
	var param = {
			"userId":gv_sessionId,
			"workId":workId,
			"boardNo":_boardData.boardNo,
	}
	gfn_ajax('board/like_ok.php',param).then(function(data){
//		//좋아요성공
//		if(workId == "like"){
//			$('#btn_like').attr("data-theme", "c").removeClass("ui-btn-up-d").addClass("ui-btn-up-c");
//		}	
//		else{//좋아요 취소
//			$('#btn_like').attr("data-theme", "d").removeClass("ui-btn-up-c").addClass("ui-btn-up-d");
//		}
		$("#board_view #btn_like").toggleClass('liked');
	});
}

var addChoice = function(choice){
	$(choice).closest('.ui-listview').addRow(choice);
	
}
//임시
var attachMore = function(menu){
	var menuId = $(menu).attr("id");
	
	if(menuId == "menu1"){
		$("#image_content").toggleClass("hidden");
	}else if(menuId=="menu2"){
		$("#video_content").toggleClass("hidden");
	}else if(menuId=="menu3"){
		$("#vote_content").toggleClass("hidden");
	}else if(menuId=="menu4"){
		$("#file_content").toggleClass("hidden");
	} 
	
};

//임시
_isVoting = true;

//투표-저장 버튼
var voteButton = function(button){
	//투표버튼을 누르면 투표선택모드 isVoting 으로
	//저장 버튼 누르면 투표확인 모드로
	var buttonText = "";
	if(_isVoting == true){
		_isVoting = false;
		buttonText = "투표하기";
		
		//투표 결과 전송
		var selectedVotes = [];
		$("#choice_list").find(".selected").each(function(){
			selectedVotes.push($(this).attr("id"));
		});
		
		var param = {
				"userId":gv_sessionId,
				"boardNo":_boardData.boardNo,
				"votes": selectedVotes
		};
		
		//서버에서 해당 게시글에 해당 유저의 필드를 모두 삭제한 후, 다시 등록한다.
		gfn_ajax('board/vote_confirm.php',param).then(function(data){
			refreshVotes();
		});
		
	}else{
		_isVoting = true;
		buttonText = "확정";
	}
	$(button).changeButtonText(buttonText);
	
};

var refreshVotes = function(param){
	
	var param = {
			"userId":gv_sessionId,
			"boardNo":_boardData.boardNo,
	};
	
	//서버에서 해당 게시글에 설문항목들과, 각 항목별 선택유저, 그리고 사용자가 선택한 항목 가져옴
	gfn_ajax('board/vote_get.php',param).then(function(data){
		_voteData = data.voteData;
		_votes = data.voteList;	//{voteNo:1,voteUserNo:19,voteUsers:[{userId:20500125,userName:'김윤혁'},{***}],myVote:true}
		_voteData.isMultiple = true;
		//OPTION 체크박스버튼 적용
		if(_voteData.isMultiple == true){
			 $("input[type='checkbox']#checkbox-multi").attr("checked",true).checkboxradio("refresh");
			 $("input[type='checkbox']#checkbox-multi").parent().find(".ui-btn-text").text("다중선택");	//단일->다중
		}
		if(_voteData.isClose == true){
			 $("input[type='checkbox']#checkbox-close").attr("checked",true).checkboxradio("refresh");
			 $("input[type='checkbox']#checkbox-close").parent().find(".ui-btn-text").text("비공개");		//공개 -> 비공개
		}
		if(_voteData.isAddable == true){
			 $("input[type='checkbox']#checkbox-add").attr("checked",true).checkboxradio("refresh");
			 $("input[type='checkbox']#checkbox-add").parent().find(".ui-btn-text").text("추가가능");	//항목추가불가 -> 가능
		}
		
		 //선택지 그리기
	    gfn_drawList("#vote_view #choice_list","choice_list",_commentList);
	    $("#vote_view #choice_list").find(".selected").each(function(){
			//선택
			$(choice).closest("li").removeClass('ui-btn-up-c');
			$(choice).closest("li").addClass('ui-btn-up-e');
		});
	});
};
	
	
_voteData.isMultiple = true;
var selectChoice = function(choice){
	//투표중일 경우 질문지 선택, 투표후 인 경우 투표자 보기
	if(_isVoting == true){
		
		if(_voteData.isMultiple == true){	//다중선택일 땐 체크박스 처럼
			if($(choice).hasClass("selected")){
				//선택 되었을때 해제
				$(choice).closest("li").addClass('ui-btn-up-c');
				$(choice).closest("li").removeClass('ui-btn-up-e');
			}else{
				//선택안되었을때 선택
				$(choice).closest("li").removeClass('ui-btn-up-c');
				$(choice).closest("li").addClass('ui-btn-up-e');
			}
			$(choice).toggleClass("selected");
		}
		else		//단일선택일땐 라디오 버튼처럼
		{
			$(choice).closest("ul").find(".selected").each(function(){
				//해제
				$(choice).closest("li").addClass('ui-btn-up-c');
				$(choice).closest("li").removeClass('ui-btn-up-e');
			});
			//선택안되었을때 선택
			$(choice).closest("li").removeClass('ui-btn-up-c');
			$(choice).closest("li").addClass('ui-btn-up-e');
			$(choice).addClass("selected");
		}
		
		
	}
	else	//투표자 보기
	{
		//익명이 아닐 경우에만 보여준다
		if(_voteData.isAnony == false){
			
		}
	}
}
/**
 * 글 삭제 (해당 좋아요, 커멘트,사진, 설문 모두 삭제)
 */
var deleteBoard = function(){
	if(!gfn_isNull(_boardData.boardNo)){
		if(gv_sessionId != _boardData.regUserId){
			alert("작성자만 삭제가 가능합니다.");
			return;
		}
		var param = {boardNo:_boardData.boardNo};
		gfn_ajax("board/delete_ok.php",param).then(function(){
			console.log("글삭제 완료");
			$.mobile.back();
			if(_isNotice ==true)
				refreshNotices();
			else
				refreshBoards(gv_groupId);
		})
	}
}

/**
 * 댓글 삭제 
 */
var deleteComment = function(commentBtn){
	var comment = $(commentBtn).parents("li");
	var commentNo = comment.attr("comment-no");
	var commentIndex = gfn_findJsonIndex(_commentList,'commentNo',commentNo);
	if(gv_sessionId != _commentList[commentIndex].userId){
		alert("작성자만 삭제가 가능합니다.");
		return;
	}
	var param= {
			workId:"delete",
			boardNo:_boardData.boardNo,
			commentNo:commentNo
	}
	gfn_ajax("board/comment_ok.php",param).then(function(){
		console.log("댓글삭제 완료");
		comment.remove();
		_commentList.splice(commentIndex,1);
	});
}

