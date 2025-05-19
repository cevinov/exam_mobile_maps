import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import HospitalCard from "../../components/HospitalCard"; // Adjust path
import { VinoColors } from "../../constants/Colors"; // Import VinoColors

interface Hospital {
  name: string;
  address: string;
  region: string;
  phone?: string;
  province: string;
}
const API_URL = "https://dekontaminasi.com/api/id/covid19/hospitals";

export default function HospitalsScreen() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    /* ... fetch logic ... */
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Hospital[] = await response.json();
        setHospitals(
          data.filter(
            (hospital) => hospital.name && hospital.name.trim() !== ""
          )
        );
      } catch (e: any) {
        console.error("Failed to fetch hospitals:", e);
        setError("Failed to load hospital data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    /* ... filter logic ... */
    if (!searchQuery) return hospitals;
    return hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hospital.address &&
          hospital.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (hospital.region &&
          hospital.region.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [hospitals, searchQuery]);

  const handlePressHospital = (hospital: Hospital) => {
    router.push({
      pathname: "/hospital-detail",
      params: { hospitalData: JSON.stringify(hospital) },
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: VinoColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={VinoColors.primary} />
        <Text style={{ color: VinoColors.text, marginTop: 10 }}>
          Loading hospitals...
        </Text>
      </View>
    );
  }
  if (error) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: VinoColors.background },
        ]}
      >
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          placeholderTextColor={VinoColors.subtleText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {filteredHospitals.length > 0 ? (
          <FlatList
            data={filteredHospitals}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item }) => (
              <HospitalCard
                hospital={item}
                onPress={() => handlePressHospital(item)}
              />
            )}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.centerContainer}>
            <Text style={{ color: VinoColors.text }}>No hospitals found.</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VinoColors.background, // Use Vino color
  },
  searchInput: {
    height: 50, // Slightly taller
    borderColor: VinoColors.separator,
    borderWidth: 1,
    borderRadius: 25, // Rounded
    paddingHorizontal: 20,
    margin: 16,
    backgroundColor: VinoColors.inputBackground,
    fontSize: 16,
    color: VinoColors.text,
    shadowColor: "#000", // Subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  list: {
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: VinoColors.background, // Use Vino color
  },
  errorText: {
    color: VinoColors.primary, // Use primary color for error text or specific errorText color
    fontSize: 16,
    textAlign: "center",
  },
});
