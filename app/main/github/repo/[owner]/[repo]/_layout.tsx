import { Stack } from 'expo-router';

export default function RepoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="issues" />
      <Stack.Screen name="prs" />
    </Stack>
  );
}
