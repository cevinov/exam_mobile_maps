// components/HospitalCard.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const HospitalCard = ({ hospital, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={require("../assets/hospital-placeholder.png")} // Using a local placeholder
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {hospital.name}
        </Text>
        <Text style={styles.address} numberOfLines={2}>
          {hospital.address}
        </Text>
        <Text style={styles.region}>{hospital.region}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#e0e0e0", // Placeholder background
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
  },
  region: {
    fontSize: 12,
    color: "#777",
  },
});

export default HospitalCard;
