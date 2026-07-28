const {
  withAndroidManifest,
  withStringsXml,
  withDangerousMod,
} = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

const widgetInfoXml = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
  android:minWidth="250dp"
  android:minHeight="40dp"
  android:minResizeWidth="180dp"
  android:minResizeHeight="40dp"
  android:updatePeriodMillis="86400000"
  android:initialLayout="@layout/continue_watching_widget"
  android:resizeMode="horizontal|vertical"
  android:widgetCategory="home_screen">
</appwidget-provider>`;

const widgetLayoutXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:orientation="vertical"
  android:padding="8dp">
  <TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/widget_name"
    android:textSize="14sp" />
</LinearLayout>`;

function withWidgetManifest(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      const receiver = {
        $: {
          'android:name': '.widget.ContinueWatchingWidget',
          'android:exported': 'true',
          'android:label': '@string/widget_name',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/continue_watching_widget_info',
            },
          },
        ],
      };
      if (!mainApplication.receiver) {
        mainApplication.receiver = [];
      }
      mainApplication.receiver.push(receiver);
    }
    return config;
  });
}

function withWidgetStrings(config) {
  return withStringsXml(config, (config) => {
    config.modResults.resources.string = config.modResults.resources.string || [];
    const existing = config.modResults.resources.string.find(
      (s) => s.$.name === 'widget_name'
    );
    if (!existing) {
      config.modResults.resources.string.push({
        $: { name: 'widget_name' },
        _: 'Continue Watching',
      });
    }
    return config;
  });
}

function withWidgetResources(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const resDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res');
      const xmlDir = path.join(resDir, 'xml');
      const layoutDir = path.join(resDir, 'layout');
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.mkdirSync(layoutDir, { recursive: true });
      const infoPath = path.join(xmlDir, 'continue_watching_widget_info.xml');
      if (!fs.existsSync(infoPath)) {
        fs.writeFileSync(infoPath, widgetInfoXml);
      }
      const layoutPath = path.join(layoutDir, 'continue_watching_widget.xml');
      if (!fs.existsSync(layoutPath)) {
        fs.writeFileSync(layoutPath, widgetLayoutXml);
      }
      return config;
    },
  ]);
}

module.exports = function withAndroidWidget(config) {
  config = withWidgetManifest(config);
  config = withWidgetStrings(config);
  config = withWidgetResources(config);
  return config;
};
