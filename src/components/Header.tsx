import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface HeaderProps {
  title: string;
  onMenuPress?: () => void;
}

export default function Header({ title, onMenuPress }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={onMenuPress}>
        <Text style={styles.menuButton}>☰</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f6f7f8",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  menuButton: { fontSize: 20 },
});
