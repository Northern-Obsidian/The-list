import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Icon, iconForMediaType } from "@/components/ui/icon";
import { useTheme } from "@/hooks/use-theme";
import { useHaptics } from "@/hooks/use-haptics";
import { router } from "expo-router";

interface TrendingRowItem {
  id: string;
  title: string;
  mediaType: string;
  year?: number | null;
  posterPath?: string | null;
}

interface TrendingRowProps {
  title?: string;
  items: TrendingRowItem[];
  style?: ViewStyle;
}

function TrendingCard({ item }: { item: TrendingRowItem }) {
  const theme = useTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        router.push(`/media/${item.id}`);
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <View style={styles.iconContainer}>
            <Icon
              name={iconForMediaType(item.mediaType)}
              size={28}
              color={theme.textSecondary}
            />
          </View>
          <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
            <ThemedText
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: '#FFFFFF',
              }}
            >
              {item.title}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function TrendingRow({ title, items, style }: TrendingRowProps) {
  const theme = useTheme();

  return (
    <ThemedView style={style}>
      {title != null && title.length > 0 && (
        <ThemedText
          style={{
            fontSize: 13,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: theme.textSecondary,
            marginBottom: 8,
          }}
        >
          {title}
        </ThemedText>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {items.map((item) => (
          <TrendingCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
});
