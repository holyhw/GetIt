import { useState, useEffect, useRef } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView } from "react-native";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type NaverLocalItem = {
  title: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
};

export type SelectedPlace = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  visible: boolean;
  onSelect: (place: SelectedPlace) => void;
  onClose: () => void;
};

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "");

async function searchLocal(query: string, token: string): Promise<SelectedPlace[]> {
  const data = await api.get<{ items: NaverLocalItem[] }>(
    `/api/search/local?query=${encodeURIComponent(query)}`,
    token
  );
  return (data.items ?? []).map((item) => ({
    name: stripHtml(item.title),
    address: item.roadAddress || item.address,
    lat: parseInt(item.mapy) / 1e7,
    lng: parseInt(item.mapx) / 1e7,
  }));
}

export function LocationSearchModal({ visible, onSelect, onClose }: Props) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const data = await searchLocal(trimmed, token ?? "");
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
        {/* 헤더 */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
          <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
            <Text style={{ fontSize: 18, color: "#434343" }}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E5E7EB" }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="장소명으로 검색"
              placeholderTextColor="#ABABAB"
              autoFocus
              style={{ flex: 1, fontSize: 14, color: "#000", padding: 0 }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#D9D9D9", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700", lineHeight: 18 }}>×</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 결과 */}
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#1E3A5F" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
            ListEmptyComponent={
              searched ? (
                <View style={{ alignItems: "center", marginTop: 60 }}>
                  <Text style={{ fontSize: 14, color: "#ABABAB" }}>검색 결과가 없어요</Text>
                </View>
              ) : (
                <View style={{ alignItems: "center", marginTop: 60 }}>
                  <Text style={{ fontSize: 14, color: "#ABABAB" }}>장소명을 입력해주세요</Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => { onSelect(item); handleClose(); }}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#EEF2F7", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Text style={{ fontSize: 16 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#000", letterSpacing: -0.3 }} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ fontSize: 11, color: "#919191", marginTop: 3, letterSpacing: -0.2 }} numberOfLines={1}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
