// vino-mobile/app/(tabs)/index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router'; // Import useRouter for navigation and Stack for header
import HospitalCard from '../../components/HospitalCard'; // Adjust path if your components folder is elsewhere

// Define the type for a hospital object (optional but good practice)
interface Hospital {
  name: string;
  address: string;
  region: string;
  phone?: string; // Optional
  province: string;
  // Add other properties if they exist
}

const API_URL = 'https://dekontaminasi.com/api/id/covid19/hospitals';

export default function HospitalsScreen() { // Renamed for clarity
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Expo Router's navigation hook

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Hospital[] = await response.json();
        setHospitals(data.filter(hospital => hospital.name && hospital.name.trim() !== ''));
      } catch (e: any) {
        console.error("Failed to fetch hospitals:", e);
        setError('Failed to load hospital data. Please try again later.');
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
    return hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hospital.address && hospital.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (hospital.region && hospital.region.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [hospitals, searchQuery]);

  const handlePressHospital = (hospital: Hospital) => {
    // Navigate to detail screen using Expo Router
    // Pass the hospital data as a query parameter (stringified)
    router.push({
      pathname: "/hospital-detail", // This will be app/hospital-detail.tsx
      params: { hospitalData: JSON.stringify(hospital) }
    });
  };

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
    <>
      {/* Configure the header for this screen */}
      <Stack.Screen options={{ title: 'Hospital List' }} />
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
            keyExtractor={(item, index) => `${item.name}-${index}`} // Ensure unique keys
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
            <Text>No hospitals found matching your search.</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  searchInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    margin: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  list: {
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  }
});