import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Details() {
  const { date_epoch, city } = useLocalSearchParams();
  const [forecastDay, setForecastDay] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);

  useEffect(() => {
    fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=b2596b00e2b548998ca153623250207&q=${city}&days=7&aqi=no&alerts=no`
    )
      .then((res) => res.json())
      .then((data) => {
        const matchedDay = data?.forecast?.forecastday.find(
          (item) => String(item.date_epoch) === String(date_epoch)
        );
        setForecastDay(matchedDay);
      })
      .catch((err) => console.log('Error:', err));
  }, [date_epoch, city]);

  if (forecastDay === undefined) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: 'white' }}>No forecast found for this date.</Text>
      </View>
    );
  }

  if (!forecastDay) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1024&q=80',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <Text style={styles.dateText}>
          {new Date(forecastDay.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <View style={styles.centered}>
          <Image
            source={{ uri: 'https:' + forecastDay.day.condition.icon }}
            style={{ height: 100, width: 100 }}
          />
          <Text style={styles.conditionText}>
            {forecastDay.day.condition.text}
          </Text>

          <TouchableOpacity onPress={() => setIsCelsius(!isCelsius)}>
            <Text style={styles.tempText}>
              {isCelsius
                ? `${forecastDay.day.avgtemp_c}°C`
                : `${forecastDay.day.avgtemp_f}°F`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.rangeText}>
            Max: {isCelsius
              ? `${forecastDay.day.maxtemp_c}°C`
              : `${forecastDay.day.maxtemp_f}°F`} / 
              
              Min: {isCelsius
                ? `${forecastDay.day.mintemp_c}°C`
                : `${forecastDay.day.mintemp_f}°F`}
          </Text>
        </View>

        <Text style={styles.hourlyTitle}>Hourly Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {forecastDay.hour.map((hour, index) => (
            <View key={index} style={styles.hourCard}>
              <Text style={styles.hourText}>
                {hour.time.split(' ')[1].slice(0, 5)}
              </Text>
              <Image
                source={{ uri: 'https:' + hour.condition.icon }}
                style={{ height: 40, width: 40 }}
              />
              <Text style={styles.hourText}>
                {isCelsius ? `${hour.temp_c} °C`: `${hour.temp_f} °F`}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // slightly darker for better contrast
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loading: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  centered: {
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 16,
  },
  conditionText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
  tempText: {
    fontSize: 42,
    color: '#fff',
    fontWeight: '800',
    marginVertical: 6,
  },
  rangeText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 6,
  },
  hourlyTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 14,
  },
  hourCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 80,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  hourText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
});

