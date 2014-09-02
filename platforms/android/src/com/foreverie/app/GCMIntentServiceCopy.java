package com.foreverie.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Vibrator;
import android.util.Log;

import com.google.android.gcm.GCMBaseIntentService;

public class GCMIntentServiceCopy extends GCMBaseIntentService {

	public static final String SENDER_ID = "kimyoon21";
	private static final String LOG_TAG = "푸쉬";

	public GCMIntentServiceCopy() {
		super(SENDER_ID);//project ID
		if (BuildConfig.DEBUG)
			Log.d(LOG_TAG, "[GCMIntentService] start");
	}

	protected void onRegistered(Context context, String registrationId) {
		Log.v(LOG_TAG, "onRegistered-registrationId = " + registrationId );
	  // 디바이스 등록 아이디 등록 처리 로직 개발
	  // 3rd Party 애플리케이션 서버와 통신함

	}

	@Override
	protected void onUnregistered(Context context, String registrationId) {
		// 디바이스 토큰 제거 성골의 동작 설명
		if (BuildConfig.DEBUG)
			Log.d(LOG_TAG, "onUnregistered-registrationId = " + registrationId);
	  // 디바이스 등록 아이디 해제 처리 로직 개발
	  // 3rd Party 애플리케이션 서버와 통신함

	}

	@Override
	protected void onMessage(Context context, Intent intent) {
		// 메세지를 수신했을 때 동작 설명
		if (BuildConfig.DEBUG)
			Log.d(LOG_TAG, "GCMReceiver Message");
		try {
			String title = intent.getStringExtra("타이틀:");
			String message = intent.getStringExtra("메시지");
			Vibrator vibrator = 
			 (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
			vibrator.vibrate(1000);
			setNotification(context, title, message);
			if (BuildConfig.DEBUG)
				Log.d(LOG_TAG, title + ":" + message);
		} catch (Exception e) {
			Log.e(LOG_TAG, "[onMessage] Exception : " + e.getMessage());
		}
	}

	@Override
	protected void onDeletedMessages(Context context, int total) {
		if (BuildConfig.DEBUG)
			Log.d(LOG_TAG, "onDeletedMessages");
		// 메세지 삭제
	}

	@Override
	public void onError(Context context, String errorId) {
		if (BuildConfig.DEBUG)
			Log.d(LOG_TAG, "onError: " + errorId);
		// 오류 발생 시 처리
	}

	@Override
	protected boolean onRecoverableError(Context context, String errorId) {
		if (BuildConfig.DEBUG)
			Log.d(LOG_TAG, "onRecoverableError: " + errorId);
		return super.onRecoverableError(context, errorId);
	}

	private void setNotification(Context context, String title, String message) {
		NotificationManager notificationManager = null;
		Notification notification = null;
		try {
			notificationManager = (NotificationManager) context
					.getSystemService(Context.NOTIFICATION_SERVICE);
			notification = new Notification(R.drawable.icon,
					message, System.currentTimeMillis());
			Intent intent = new Intent(context, ReverieApp.class);
			PendingIntent pi = PendingIntent.getActivity(context, 0, intent, 0);
			notification.setLatestEventInfo(context, title, message, pi);
			notificationManager.notify(0, notification);
		} catch (Exception e) {
			Log.e(LOG_TAG, "[setNotification] Exception : " + e.getMessage());
		}
	}
}