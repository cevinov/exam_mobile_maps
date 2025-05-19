// vino-mobile/app/hospital-detail.tsx
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
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, Stack } from "expo-router";

interface Hospital {
  name: string;
  address: string;
  region: string;
  phone?: string;
  province: string;
}

export default function HospitalDetailScreen() {
  const params = useLocalSearchParams<{ hospitalData: string }>(); // Typed params
  const { hospitalData } = params;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (hospitalData) {
      try {
        const parsedHospital: Hospital = JSON.parse(hospitalData);
        setHospital(parsedHospital);
      } catch (e) {
        console.error("Error parsing hospital data:", e);
        setMapError("Failed to load hospital details.");
      }
    } else {
      setMapError("No hospital data provided.");
    }
  }, [hospitalData]);

  useEffect(() => {
    if (!hospital) return;

    const geocodeAddress = async () => {
      setLoadingMap(true);
      setMapError(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setMapError("Permission to access location was denied.");
          setLoadingMap(false);
          return;
        }

        let addressToGeocode = hospital.address;
        if (hospital.region) addressToGeocode += `, ${hospital.region}`;
        if (hospital.province) addressToGeocode += `, ${hospital.province}`;

        let geocodedLocations: Location.LocationGeocodedLocation[] = [];
        const geocodeAttempts = [
          addressToGeocode,
          hospital.region,
          hospital.province,
        ].filter(Boolean);

        for (const attempt of geocodeAttempts) {
          try {
            geocodedLocations = await Location.geocodeAsync(attempt as string);
            if (geocodedLocations.length > 0) break;
          } catch (geoError) {
            console.log(`Geocoding attempt failed for "${attempt}":`, geoError);
          }
        }

        if (geocodedLocations.length > 0) {
          setMapRegion({
            latitude: geocodedLocations[0].latitude,
            longitude: geocodedLocations[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          setMapError(
            `Could not find location for "${hospital.name}". Address: ${addressToGeocode}`
          );
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setMapError("Error finding location.");
      } finally {
        setLoadingMap(false);
      }
    };

    geocodeAddress();
  }, [hospital]);

  const openMapInExternalApp = () => {
    if (!mapRegion) {
      Alert.alert("Location Not Found", "Cannot open in maps.");
      return;
    }
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${mapRegion.latitude},${mapRegion.longitude}`;
    const label = hospital?.name || "Hospital";
    const addressForQuery = hospital?.address
      ? encodeURIComponent(`${hospital.name}, ${hospital.address}`)
      : latLng;

    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}&q=${addressForQuery}`,
      android: `${scheme}${latLng}(${label})?q=${addressForQuery}`,
    });
    Linking.openURL(url!).catch((err) =>
      Alert.alert("Error", "Could not open map app.")
    );
  };

  const makePhoneCall = () => {
    if (hospital?.phone) {
      let phoneNumber = hospital.phone.replace(/\D/g, "");
      const callUrl =
        Platform.OS === "android"
          ? `tel:${phoneNumber}`
          : `telprompt:${phoneNumber}`;
      Linking.openURL(callUrl).catch(() =>
        Alert.alert("Error", "Could not make the call.")
      );
    } else {
      Alert.alert(
        "No Phone Number",
        "This hospital does not have a phone number listed."
      );
    }
  };

  if (!hospital && !mapError) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading details...</Text>
      </View>
    );
  }
  if (mapError && !hospital) {
    // If hospital parsing failed
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{mapError}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: hospital?.name || "Hospital Detail" }} />
      <ScrollView style={styles.container}>
        {hospital && (
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
        )}

        {loadingMap && (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text>Loading map...</Text>
          </View>
        )}
        {mapError && !loadingMap && (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.errorText}>{mapError}</Text>
            {hospital && (
              <Text>
                Attempted for: {hospital.address}, {hospital.region}
              </Text>
            )}
          </View>
        )}
        {!loadingMap && mapRegion && !mapError && (
          <MapView style={styles.map} initialRegion={mapRegion}>
            <Marker
              coordinate={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
              }}
              title={hospital?.name}
              description={hospital?.address}
            />
          </MapView>
        )}
        {!loadingMap && mapRegion && (
          <View style={styles.buttonContainer}>
            <Button title="Open in Maps App" onPress={openMapInExternalApp} />
          </View>
        )}
      </ScrollView>
    </>
  );
}

// ... (styles from your original DetailScreen.js, plus centerContainer if needed)
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
    minHeight: 200, // Give it some space even with error text
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    margin: 20,
    padding: 10,
    borderRadius: 8,
  },
  map: {
    height: 300,
    marginHorizontal: Platform.OS === "ios" ? 0 : 20,
    marginTop: 20,
    marginBottom: Platform.OS === "ios" ? 0 : 20,
    borderRadius: Platform.OS === "ios" ? 0 : 8,
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
  centerContainer: {
    // For initial loading
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
