// screens/DetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
  Button,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const DetailScreen = ({ route }) => {
  const { hospital } = route.params;
  const [location, setLocation] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      setLoadingMap(true);
      setMapError(null);
      try {
        // Request permissions first
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setMapError(
            "Permission to access location was denied. Map cannot be displayed."
          );
          setLoadingMap(false);
          return;
        }

        // Try geocoding with full address, then progressively simpler versions
        let addressToGeocode = hospital.address;
        if (hospital.region) addressToGeocode += `, ${hospital.region}`;
        if (hospital.province) addressToGeocode += `, ${hospital.province}`;

        let geocodedLocations = [];

        // Attempt 1: Full address
        if (hospital.address) {
          geocodedLocations = await Location.geocodeAsync(addressToGeocode);
        }

        // Attempt 2: Region if first attempt fails and region exists
        if (geocodedLocations.length === 0 && hospital.region) {
          console.log("Retrying geocode with region:", hospital.region);
          geocodedLocations = await Location.geocodeAsync(hospital.region);
        }

        // Attempt 3: Province if second attempt fails and province exists
        if (geocodedLocations.length === 0 && hospital.province) {
          console.log("Retrying geocode with province:", hospital.province);
          geocodedLocations = await Location.geocodeAsync(hospital.province);
        }

        if (geocodedLocations && geocodedLocations.length > 0) {
          setLocation({
            latitude: geocodedLocations[0].latitude,
            longitude: geocodedLocations[0].longitude,
            latitudeDelta: 0.01, // Zoom level
            longitudeDelta: 0.01, // Zoom level
          });
        } else {
          setMapError("Could not find location for this address.");
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setMapError(
          "Error finding location. Map might be inaccurate or unavailable."
        );
      } finally {
        setLoadingMap(false);
      }
    };

    geocodeAddress();
  }, [hospital]);

  const openMapInExternalApp = () => {
    if (!location) {
      Alert.alert(
        "Location Not Found",
        "Cannot open in maps as the location could not be determined."
      );
      return;
    }
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${location.latitude},${location.longitude}`;
    // Try to use a more precise address if available, otherwise fall back to latLng
    const label = hospital.name;
    const addressForQuery = hospital.address
      ? encodeURIComponent(`${hospital.name}, ${hospital.address}`)
      : latLng;

    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}&q=${addressForQuery}`,
      android: `${scheme}${latLng}(${label})?q=${addressForQuery}`,
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Don't know how to open this map.");
        }
      })
      .catch((err) => Alert.alert("Error", "An error occurred: " + err));
  };

  const makePhoneCall = () => {
    if (hospital.phone) {
      let phoneNumber = hospital.phone.replace(/\D/g, ""); // Remove non-digits
      if (Platform.OS === "android") {
        phoneNumber = `tel:${phoneNumber}`;
      } else {
        phoneNumber = `telprompt:${phoneNumber}`;
      }
      Linking.canOpenURL(phoneNumber)
        .then((supported) => {
          if (!supported) {
            Alert.alert("Phone number is not available");
          } else {
            return Linking.openURL(phoneNumber);
          }
        })
        .catch((err) => console.log(err));
    } else {
      Alert.alert(
        "No Phone Number",
        "This hospital does not have a phone number listed."
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailSection}>
        <Text style={styles.name}>{hospital.name}</Text>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{hospital.address || "N/A"}</Text>
        <Text style={styles.label}>Region:</Text>
        <Text style={styles.value}>{hospital.region || "N/A"}</Text>
        <Text style={styles.label}>Province:</Text>
        <Text style={styles.value}>{hospital.province || "N/A"}</Text>
        <Text style={styles.label}>Phone:</Text>
        {hospital.phone ? (
          <TouchableOpacity onPress={makePhoneCall}>
            <Text style={[styles.value, styles.phoneLink]}>
              {hospital.phone}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.value}>N/A</Text>
        )}
      </View>

      {loadingMap && (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading map...</Text>
        </View>
      )}
      {mapError && !loadingMap && (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.errorText}>{mapError}</Text>
          <Text>
            Address: {hospital.address}, {hospital.region}
          </Text>
        </View>
      )}
      {!loadingMap && location && !mapError && (
        <MapView style={styles.map} initialRegion={location}>
          <Marker
            coordinate={location}
            title={hospital.name}
            description={hospital.address}
          />
        </MapView>
      )}
      {!loadingMap && location && (
        <View style={styles.buttonContainer}>
          <Button title="Open in Maps App" onPress={openMapInExternalApp} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  phoneLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  mapPlaceholder: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    margin: 20,
    borderRadius: 8,
  },
  map: {
    height: 300,
    marginHorizontal: Platform.OS === "ios" ? 0 : 20, // Fix map horizontal margin on Android
    marginTop: 20,
    marginBottom: Platform.OS === "ios" ? 0 : 20,
    borderRadius: Platform.OS === "ios" ? 0 : 8, // Only apply border radius on Android for standalone map
  },
  errorText: {
    color: "red",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginVertical: 15,
    marginHorizontal: 20,
  },
});

export default DetailScreen;
