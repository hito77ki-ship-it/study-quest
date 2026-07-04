package com.studyquest.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;

public class StudyQuestWidgetProvider extends AppWidgetProvider {
    private static final String BASE_URL = "https://study-quest.net/";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.study_quest_widget);
            views.setOnClickPendingIntent(R.id.widgetQuickLog, launchIntent(context, "quickLog=1", 10));
            views.setOnClickPendingIntent(R.id.widgetRecord15, launchIntent(context, "quickRecord=15", 15));
            views.setOnClickPendingIntent(R.id.widgetRecord30, launchIntent(context, "quickRecord=30", 30));
            views.setOnClickPendingIntent(R.id.widgetRecord60, launchIntent(context, "quickRecord=60", 60));
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }

    private static PendingIntent launchIntent(Context context, String query, int requestCode) {
        Uri uri = Uri.parse(BASE_URL + "?tab=quest&" + query);
        Intent intent = new Intent(context, LauncherActivity.class);
        intent.setAction(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        intent.setData(uri);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getActivity(context, requestCode, intent, flags);
    }
}
