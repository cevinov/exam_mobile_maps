import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { VinoColors } from "../constants/Colors"; // Import VinoColors

// Define props type
interface Hospital {
  name: string;
  address: string;
  region: string;
}
interface HospitalCardProps {
  hospital: Hospital;
  onPress: () => void;
}

const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={require("../assets/hospital-placeholder.png")} // Ensure path is correct
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {hospital.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {hospital.address}
        </Text>
        <Text style={styles.region}>{hospital.region}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: VinoColors.cardBackground,
    borderRadius: 12, // Slightly more rounded
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: VinoColors.separator, // Subtle border
  },
  image: {
    width: 55, // Slightly smaller
    height: 55,
    borderRadius: 8, // Less rounded, more like a tile
    marginRight: 15,
    backgroundColor: VinoColors.background, // Placeholder background
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 17, // Slightly larger
    fontWeight: "600", // Semi-bold
    marginBottom: 5,
    color: VinoColors.primary, // Name in primary color
  },
  address: {
    fontSize: 13,
    color: VinoColors.text,
    marginBottom: 3,
  },
  region: {
    fontSize: 12,
    color: VinoColors.subtleText,
  },
});

export default HospitalCard;
