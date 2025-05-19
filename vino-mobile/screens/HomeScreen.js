// screens/HomeScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import HospitalCard from "../components/HospitalCard";

const API_URL = "https://dekontaminasi.com/api/id/covid19/hospitals";

const HomeScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Filter out entries without a name, as they are not useful
        setHospitals(
          data.filter(
            (hospital) => hospital.name && hospital.name.trim() !== ""
          )
        );
      } catch (e) {
        console.error("Failed to fetch hospitals:", e);
        setError("Failed to load hospital data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    if (!searchQuery) {
      return hospitals;
    }
    return hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hospital.address &&
          hospital.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (hospital.region &&
          hospital.region.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [hospitals, searchQuery]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading hospitals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search hospitals by name, address, or region..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {filteredHospitals.length > 0 ? (
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item, index) => item.name + index} // API might have duplicate names
          renderItem={({ item }) => (
            <HospitalCard
              hospital={item}
              onPress={() => navigation.navigate("Detail", { hospital: item })}
            />
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text>No hospitals found matching your search.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  searchInput: {
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    margin: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  list: {
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});

export default HomeScreen;
