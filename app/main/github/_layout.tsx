import { Stack } from 'expo-router';

export default function GitHubLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="repo" />
    </Stack>
  );
}
