import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="Home" options={{ headerShown: false }} />
    </Stack>
  );
}