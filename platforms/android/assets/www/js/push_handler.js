	//푸쉬준비
	document.addEventListener("deviceready", onDeviceReady, false);	//push_handler.js
	
var GCM_PROJECT_NUMBER = "7195875486";	// GCM SENDER ID = PROJECT NUMBER (not project ID:kimyoon21)
function onDeviceReady() {
	var deviceId = window.localStorage.getItem("DEV_ID");
	var devRegistered = window.localStorage.getItem("DEV_REGISTERED");
	if(gfn_isNull(deviceId))deviceId='null';
	if(gfn_isNull(devRegistered))devRegistered='null';
	
	var pushNotification;
	pushNotification = window.plugins.pushNotification; 

	if (device.platform == 'android' || device.platform == 'Android') {
		pushNotification.register(successHandler, errorHandler,{"senderID":GCM_PROJECT_NUMBER,"deviceID":deviceId,"deviceIsReg":devRegistered,"ecb":"onNotification"});
	} else {
		pushNotification.register(tokenHandler, errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
	}       

	//$("#app-status-ul").append('<li>deviceready event received</li>');

	/**
	 * 백버튼 이벤트 사용중지
	 */
	document.addEventListener("backbutton", function(e)
			{
		var url = location.href;
		url = (url.split("#"))[0];
		console.log("현재위치 : "+url);
		if( url == "file://"+ROOT_URL+"index.html")	//메인 화면일경우 바로 꺼지기
		{
			e.preventDefault();
			//pushNotification.unregister(successHandler, errorHandler);
			//if(confirm("어플을 .."))
			navigator.app.exitApp();
		}
		else
		{
			navigator.app.backHistory();
		}
			}, false);

	// aditional onDeviceReady work…
}

// result contains any message sent from the plugin call
function successHandler (result) {
	console.log("레지스터" + result);
	
	//alert('result = '+result);
	//$("#app-status-ul").append('<li>result = '+result+'</li>');
}

// result contains any error description text returned from the plugin call
function errorHandler (error) {
	alert('error = '+error);
	//$("#app-status-ul").append('<li>error = '+error+'</li>');
}

function tokenHandler (result) {
	// Your iOS push server needs to know the token before it can push to this device
	// here is where you might want to send it the token for later use.
	alert('device token = '+result);
	//$("#app-status-ul").append('<li>device token = '+result+'</li>');
}

// iOS
function onNotificationAPN(event) {
	if (event.alert) {
		navigator.notification.alert(event.alert);
	}

	if (event.sound) {
		var snd = new Media(event.sound);
		snd.play();
	}

	if (event.badge) {
		pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
	}
}
//Android - 포레버리용
function onNotification(e) {
	switch( e.event )
	{
	case 'registered':
		
		//기등록 안되있을 경우 등록
		if ( e.regid.length > 0 )
		{
			console.log("세션저장 디바이스 푸쉬 아이디 = " + e.regid);
			window.localStorage.setItem("DEV_ID",e.regid);

			gfn_loadSessionData();
			if(!gfn_isNull(e.regid) && !gfn_isNull(gv_sessionId)){
				var param = { 
						userId:gv_sessionId,
						devId :e.regid
				}
				gfn_ajax('user/push_reg_ok.php',param).then(function (data) {
					if(data == 1){
						console.log("DB에 사용자 디바이스아이디 등록 성공!!");
						window.localStorage.setItem("DEV_REGISTERED","true");
					}else{
						console.log("DB에 사용자 디바이스아이디 등록 실패 ㅜㅜㅜ");
					}
				});
			}
			
		}
		break;
	case 'message':
		
		
		// if this flag is set, this notification happened while we were in the foreground.
		// you might want to play a sound to get the user's attention, throw up a dialog, etc.
		if (e.foreground)	//보고잇을때
		{
			alert("["+e.payload.groupName + "]에 새글이 올라왔습니다!");
			// if the notification contains a soundname, play it.
			//var my_media = new Media("/android_asset/www/"+e.soundname);
			//my_media.play();
		}
		else		//안보고있을때
		{   // otherwise we were launched because the user touched a notification in the notification tray.
			if (e.coldstart)	//재시작
				getBoard(e.payload.boardNo);
			else				//백그라운드 열기
				getBoard(e.payload.boardNo);
		}
		refreshNotices();
//		$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
//		$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
		break;
	case 'error':
		console.log(" 푸쉬 디바이스 아이디 등록 에러 :  " + e.msg);
		break;
	}
}

// Android - 기본
function onNotificationGCM(e) {
	//$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

	switch( e.event )
	{
	case 'registered':
		if ( e.regid.length > 0 )
		{
			$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
			// Your GCM push server needs to know the regID before it can push to this device
			// here is where you might want to send it the regID for later use.
			console.log("regID = " + e.regid);
		}
		break;

	case 'message':
		// if this flag is set, this notification happened while we were in the foreground.
		// you might want to play a sound to get the user's attention, throw up a dialog, etc.
		if (e.foreground)
		{
			$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

			// if the notification contains a soundname, play it.
			//var my_media = new Media("/android_asset/www/"+e.soundname);
			//my_media.play();
		}
		else
		{   // otherwise we were launched because the user touched a notification in the notification tray.
			if (e.coldstart)
				$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
			else
				$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
		}

		$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
		$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
		break;

	case 'error':
		$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
		break;

	default:
		$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
	break;
	}
} 