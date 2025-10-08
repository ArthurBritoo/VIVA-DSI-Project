import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface SuccessFeedbackProps {
  message: string;
}

export default function SuccessFeedback({ message }: SuccessFeedbackProps) {
  return (
    <View style={styles.successContainer}>
      <AntDesign name="checkcircleo" size={80} color="#4CAF50" />
      <Text style={styles.successText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  successText: {
    fontSize: 20,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
});