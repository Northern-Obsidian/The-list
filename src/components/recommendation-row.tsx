import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Icon, iconForMediaType } from "@/components/ui/icon";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useHaptics } from "@/hooks/use-haptics";
import { router } from "expo-router";

interface RecommendationRowItem {
  id: string;
  title: string;
  mediaType: string;
  year?: number | null;
  posterPath?: string | null;
}

interface RecommendationRowProps {
  title?: string;
  items: RecommendationRowItem[];
  style?: ViewStyle;
}

function RecommendationCard({ item }: { item: RecommendationRowItem }) {
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
            { borderRadius: 12, backgroundColor: theme.backgroundElement },
          ]}
        >
          <View
            style={[
              styles.posterArea,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <Icon
              name={iconForMediaType(item.mediaType)}
              size={32}
              color={theme.textSecondary}
            />
          </View>
          <View style={styles.cardContent}>
            <ThemedText
              numberOfLines={2}
              style={{ fontSize: 12, fontWeight: "600", lineHeight: 16 }}
            >
              {item.title}
            </ThemedText>
            {item.year != null && (
              <ThemedText
                style={{
                  fontSize: 11,
                  color: theme.textSecondary,
                }}
              >
                {item.year}
              </ThemedText>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function RecommendationRow({
  title,
  items,
  style,
}: RecommendationRowProps) {
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
          <RecommendationCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  posterArea: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: 8,
    gap: 2,
  },
});
