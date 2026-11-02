import * as Notifications from 'expo-notifications';
import { Alert, Button, Text, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Notifications disabled',
      'Go to Settings > Expo Go > Notifications to enable them.'
    );
    return false;
  }
  return true;
}

async function scheduleAlarm(seconds: number) {
  if (!(await requestPermission())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'BRO ALARM',
      body: `${seconds} seconds have passed`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
  Alert.alert('Scheduled', `Lock your phone and wait ${seconds} seconds`);
}

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', backgroundColor: 'white', color: 'black' }}>Step 2: Local alarm test</Text>
      <Button title="Schedule in 20 seconds" onPress={() => scheduleAlarm(20)} />
      <Button
        title="Cancel all"
        onPress={() => Notifications.cancelAllScheduledNotificationsAsync()}
      />
    </View>
  );
}