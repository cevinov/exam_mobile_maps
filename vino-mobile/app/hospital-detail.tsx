import React, { useState, useEffect } from "react";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { VinoColors } from "../constants/Colors"; // Import VinoColors
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

interface Hospital {
  name: string;
  address: string;
  region: string;
  phone?: string;
  province: string;
}

export default function HospitalDetailScreen() {
  const params = useLocalSearchParams<{ hospitalData: string }>();
  const { hospitalData } = params;
  const router = useRouter(); // For setting title

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (hospitalData) {
      try {
        const parsedHospital: Hospital = JSON.parse(hospitalData);
        setHospital(parsedHospital);
      } catch (e) {}
    } else {
    }
  }, [hospitalData, router]);

  useEffect(() => {
    // Geocoding effect
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
      <Stack.Screen options={{ title: hospital?.name || "Hospital Details" }} />
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

        {/* Map Section */}
        {loadingMap && (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={VinoColors.primary} />
            <Text style={{ color: VinoColors.text, marginTop: 10 }}>
              Loading map...
            </Text>
          </View>
        )}
        {mapError && !loadingMap && (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapErrorText}>{mapError}</Text>
            {hospital && (
              <Text
                style={{
                  color: VinoColors.subtleText,
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
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
              pinColor={VinoColors.primary} // Use primary color for map marker
            />
          </MapView>
        )}
        {!loadingMap && mapRegion && (
          <View style={styles.buttonContainer}>
            <Button
              title="Open in Maps App"
              onPress={openMapInExternalApp}
              color={VinoColors.primary}
            />
          </View>
        )}
        {/* Placeholder for extra space at the bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VinoColors.background,
  },
  detailSection: {
    padding: 20,
    backgroundColor: VinoColors.cardBackground, // Card-like background for details
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 26, // Larger name
    fontWeight: "bold",
    marginBottom: 15,
    color: VinoColors.primary,
    textAlign: "center", // Center align name
  },
  label: {
    fontSize: 14,
    color: VinoColors.subtleText,
    marginTop: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: VinoColors.text,
    marginBottom: 5,
    lineHeight: 22, // Better readability
  },
  phoneLink: {
    color: VinoColors.accent, // Use accent for links
    textDecorationLine: "underline",
  },
  mapPlaceholder: {
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: VinoColors.background, // Lighter placeholder
    marginHorizontal: 16,
    marginTop: 0, // Closer to details section
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VinoColors.separator,
    padding: 15,
  },
  map: {
    height: 300,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 12, // Rounded map
    overflow: "hidden", // Ensures border radius is applied
  },
  mapErrorText: {
    // Renamed from errorText to avoid conflict
    color: VinoColors.primary,
    textAlign: "center",
    paddingHorizontal: 10,
    fontSize: 15,
  },
  buttonContainer: {
    marginVertical: 10, // Reduced vertical margin
    marginHorizontal: 16,
    borderRadius: 25, // Rounded button container for a single button
    overflow: "hidden", // To make Button's color prop respect borderRadius on Android
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: VinoColors.background,
  },
  errorText: {
    color: VinoColors.primary, // Use primary color for error text or specific errorText color
    fontSize: 16,
    textAlign: "center",
  },
});
