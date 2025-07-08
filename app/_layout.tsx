import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerShown: true,
          title: '🌤️ Detailed Forecast',
          headerStyle: {
            backgroundColor: '#2a3f57', // Soft dusk-blue, matches image mood
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            
          },
        }}
      />
    </Stack>
  );
}
