import AntDesign from '@expo/vector-icons/AntDesign';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Homescreen() {
  const [location, setLocation] = useState('');
  const [obj, setObj] = useState([]);
  const [forecast, setForecast] = useState({});
  const [showSearch, setShow] = useState(true);
  const [isCelsius, setIsCelsius] = useState(true);
  const router = useRouter();

  //  Auto-fetch current location city weather
  useEffect(() => {
    (async () => {

      // work with permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      //get the location coordinates
      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;


      //takes GPS coordinates and returns an array of object location info.
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      // console.log(geocode);


      if (geocode.length > 0) {
        const currentCity = geocode[0].city;
        if (currentCity) {
          handleLocation({ name: currentCity });
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (location.length > 2) {
      fetch(
        `https://api.weatherapi.com/v1/search.json?key=b2596b00e2b548998ca153623250207&q=${location}`
      )
        .then((res) => res.json())
        .then((data) => setObj(data))
        .catch((err) => console.log('Error: ', err));
    } else {
      setObj([]);
    }
  }, [location]);

  const handleLocation = (item) => {
    setObj([]);
    setShow(false);
    fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=b2596b00e2b548998ca153623250207&q=${item.name}&days=7&aqi=no&alerts=no`
    )
      .then((res) => res.json())
      .then((data) => setForecast(data))
      .catch((err) => console.log('Error: ', err));
  };

  const currentHour = new Date().getHours();
  // console.log(forecast);
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1024&q=80'
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.searchWrapper}>
              {showSearch && (
                <TextInput
                  placeholder="Search the city"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.searchInput}
                  placeholderTextColor="#555"
                />
              )}
              <TouchableOpacity
                onPress={() => setShow(!showSearch)}
                style={styles.searchIcon}
              >
                <AntDesign name="search1" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={obj}
              keyExtractor={(item) => item.id?.toString() ?? item.name}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleLocation(item)}>
                  <View style={styles.item}>
                    <Text style={styles.itemText}>
                      {item.name}, {item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.forecastContainer}>
            <Text style={styles.cityText}>
              {forecast?.location?.name}, <Text style={styles.countryText}>{forecast?.location?.country}</Text>
            </Text>
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: 'https:' + forecast?.current?.condition?.icon }}
                style={styles.weatherIcon}
              />
            </View>
          </View>

          <View style={styles.tempSection}>
            <TouchableOpacity onPress={() => setIsCelsius(!isCelsius)}>
              <Text style={styles.tempText}>
                {isCelsius
                  ? `${forecast?.current?.temp_c}°C`
                  : `${forecast?.current?.temp_f}°F`}
              </Text>
            </TouchableOpacity>
            <Text style={styles.conditionText}>
              {forecast?.current?.condition?.text}
            </Text>

          </View>

          <View style={styles.extraInfo}>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Wind</Text>
              <Text style={styles.value}>{forecast?.current?.wind_mph} mph</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Humidity</Text>
              <Text style={styles.value}>{forecast?.current?.humidity} %</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Direction</Text>
              <Text style={styles.value}>{forecast?.current?.wind_dir}</Text>
            </View>
          </View>
          
          {/* Hourly forecast  */}
          <Text style={styles.sectionTitle}>Hourly Forecast</Text>
          <View style={{ marginTop: 5 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {forecast?.forecast?.forecastday[0]?.hour
                ?.filter((item) => parseInt(item.time.split(' ')[1].split(':')[0], 10) >= currentHour)
                .map((item, index) => (
                  <View key={index} style={styles.forecastSec}>
                    <Text style={{ color: 'white', marginTop: 2 }}>{item?.time?.split(' ')[1]}</Text>
                    <Image
                      source={{ uri: 'https:' + item?.condition?.icon }}
                      style={{ height: 35, width: 35 }}
                    />
                    <Text style={{ color: 'white', marginTop: 2 }}> {isCelsius ? `${item?.temp_c}°C` : `${item?.temp_f}°F`}</Text>
                  </View>
                ))}
            </ScrollView>
          </View>
          {/* Weekly forecast  */}
          <Text style={styles.sectionTitle}>Weekly Forecast</Text>
          <View style={{ marginTop: 5, marginBottom: 0 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {forecast?.forecast?.forecastday?.map((item, index) => (
                <View key={index} style={styles.forecastSec}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/details?date_epoch=${item.date_epoch}&city=${forecast?.location?.name}`)
                    }
                  >
                    <Image
                      source={{ uri: 'https:' + item?.day?.condition?.icon }}
                      style={{ height: 50, width: 50 }}
                    />
                    <Text style={{ color: 'white', marginTop: 2 }}>
                      {new Date(item?.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </Text>
                    <Text style={{ color: 'white', marginTop: 2 }}>
                      {isCelsius
                        ? `${item?.day?.maxtemp_c}°C/${item?.day?.mintemp_c}°C`
                        : `${item?.day?.maxtemp_f}°F/${item?.day?.mintemp_f}°F`}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Adding Additional Details  */}
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <View style={styles.additionalInfoContainer}>
            <View style={styles.additionalBox}>
              <Text style={styles.label}>Feels Like</Text>
              <Text style={styles.value}>
                {isCelsius ? `${forecast?.current?.feelslike_c}°C` : `${forecast?.current?.feelslike_f}°F`}
              </Text>
            </View>

            <View style={styles.additionalBox}>
              <Text style={styles.label}>Sunrise</Text>
              <Text style={styles.value}>
                {forecast?.forecast?.forecastday?.[0]?.astro?.sunrise}
              </Text>
            </View>

            <View style={styles.additionalBox}>
              <Text style={styles.label}>Sunset</Text>
              <Text style={styles.value}>
                {forecast?.forecast?.forecastday?.[0]?.astro?.sunset}
              </Text>
            </View>

            <View style={styles.additionalBox}>
              <Text style={styles.label}>UV Index</Text>
              <Text style={styles.value}>{forecast?.current?.uv}</Text>
            </View>

            <View style={styles.additionalBox}>
              <Text style={styles.label}>Pressure</Text>
              <Text style={styles.value}>{forecast?.current?.pressure_mb} mb</Text>
            </View>

            <View style={styles.additionalBox}>
              <Text style={styles.label}>Visibility</Text>
              <Text style={styles.value}>{forecast?.current?.vis_km} km</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    padding: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    paddingLeft: 8,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  forecastContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  cityText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
  },
  countryText: {
    fontSize: 26,
    fontWeight: '400',
    color: '#ddd',
  },
  iconContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  weatherIcon: {
    height: 120,
    width: 120,
  },
  tempSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tempText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  conditionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#eee',
    marginTop: 4,
  },
  extraInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 10,
    minWidth: 90,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  forecastSec: {
    backgroundColor: 'rgba(131, 127, 127, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  additionalInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },

  additionalBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 10,
    minWidth: '45%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },


});
