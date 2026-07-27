const { withAndroidManifest, withProjectBuildGradle } = require('expo/config-plugins');

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

module.exports = function withAndroidWidget(config) {
  config = withWidgetManifest(config);
  return config;
};
