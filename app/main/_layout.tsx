import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" />
      <Stack.Screen name="tier" />
      <Stack.Screen name="user" />
      <Stack.Screen name="category" />
      <Stack.Screen name="ranking" />
      <Stack.Screen name="github" />
    </Stack>
  );
}
