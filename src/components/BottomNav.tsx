import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Animated, StyleSheet, Easing, Text } from "react-native";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Buscar: undefined;
  Perfil: undefined;
};

interface BottomNavProps {
  activeScreen: 'Home' | 'Buscar' | 'Perfil';
}

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [active, setActive] = useState(activeScreen.toLowerCase());

  const animations = {
    home: useRef(new Animated.Value(activeScreen === 'Home' ? 1 : 0)).current,
    buscar: useRef(new Animated.Value(activeScreen === 'Buscar' ? 1 : 0)).current,
     perfil: useRef(new Animated.Value(activeScreen === 'Perfil' ? 1 : 0)).current,
  };

  const handlePress = (tabName: 'home' | 'buscar' | 'perfil', screenName: 'Home' | 'Buscar' | 'Perfil') => {
    setActive(tabName);
    Object.keys(animations).forEach((key) => {
      Animated.timing(animations[key as keyof typeof animations], {
        toValue: key === tabName ? 1 : 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    });
    navigation.navigate(screenName);
  };

  const renderIcon = (iconName: keyof typeof Ionicons.glyphMap, tabName: 'home' | 'buscar' | 'perfil', screenName: 'Home' | 'Buscar' | 'Perfil', label: string) => {
    const scale = animations[tabName].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.3],
    });

    const bgOpacity = animations[tabName].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const color = animations[tabName].interpolate({
      inputRange: [0, 1],
      outputRange: ["#444", "#fff"],
    });

    return (
      <TouchableOpacity onPress={() => handlePress(tabName, screenName)} activeOpacity={0.8}>
        <Animated.View style={[styles.tab]}>
          <Animated.View
            style={[
              styles.circle,
              { opacity: bgOpacity, transform: [{ scale }] },
            ]}
          >
            <View style={styles.blueCircle} />
          </Animated.View>
          <AnimatedIcon name={iconName} size={26} color={color} style={{ transform: [{ scale }] }} />
          {active !== tabName && <Text style={styles.navLabel}>{label}</Text>}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bottomNav}>
      {renderIcon("search", "buscar", "Buscar", "Search")}
      {renderIcon("home", "home", "Home", "Home")}
      {renderIcon("person", "perfil", "Perfil", "Profile")}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 55,
  },
  circle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  blueCircle: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
  },
  navLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default BottomNav;
