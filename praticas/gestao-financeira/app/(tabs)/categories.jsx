import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { MoneyContext } from "../../contexts/GlobalState";
import Button from "../../components/Button";
import CategoryItem from "../../components/CategoryItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

const PRESET_COLORS = [
  "#DE9AC3","#DEA17B","#E6E088","#AB8FBE",
  "#82C9DE","#FFB6B6","#9ED9A9","#F5C26B",
];

const ICON_OPTIONS = [
  { label: "Etiqueta",   value: "label" },
  { label: "Coração",    value: "favorite" },
  { label: "Comida",     value: "fastfood" },
  { label: "Casa",       value: "home" },
  { label: "Livro",      value: "book" },
  { label: "Viagem",     value: "airplanemode-active" },
  { label: "Carro",      value: "directions-car" },
  { label: "Hospital",   value: "local-hospital" },
  { label: "Academia",   value: "fitness-center" },
  { label: "Compras",    value: "shopping-cart" },
  { label: "Animal",     value: "pets" },
  { label: "Música",     value: "music-note" },
  { label: "Futebol",    value: "sports-soccer" },
  { label: "Trabalho",   value: "work" },
  { label: "Escola",     value: "school" },
  { label: "Café",       value: "local-cafe" },
];

export default function CategoriesScreen() {
  const { categories, loading, addCategory, removeCategory } = useContext(MoneyContext);

  const [name, setName]               = useState("");
  const [displayName, setDisplayName] = useState("");
  const [icon, setIcon]               = useState("label");
  const [background, setBackground]   = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting]   = useState(false);

  const resetForm = () => {
    setName(""); setDisplayName(""); setIcon("label"); setBackground(PRESET_COLORS[0]);
  };

  const handleCreate = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert("Informe um identificador (mín. 2 letras, sem espaços)."); return;
    }
    if (!displayName.trim() || displayName.trim().length < 2) {
      Alert.alert("Informe o nome de exibição (mín. 2 letras)."); return;
    }
    setSubmitting(true);
    try {
      await addCategory({
        name: name.trim().toLowerCase().replace(/\s+/g, "_"),
        displayName: displayName.trim(),
        icon,
        background,
        isIncome: false,
      });
      resetForm();
      Alert.alert("Categoria criada!");
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message ?? "Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Excluir categoria",
      `Deseja excluir "${item.displayName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: "destructive",
          onPress: async () => {
            try { await removeCategory(item.id); }
            catch (e) { Alert.alert("Erro ao excluir", e.message ?? "Tente novamente."); }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading && categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Nova categoria</Text>

            <View>
              <Text style={globalStyles.inputLabel}>Identificador</Text>
              <TextInput value={name} onChangeText={setName} placeholder="ex.: health"
                autoCapitalize="none" style={globalStyles.input} />
            </View>

            <View>
              <Text style={globalStyles.inputLabel}>Nome de exibição</Text>
              <TextInput value={displayName} onChangeText={setDisplayName}
                placeholder="ex.: Saúde" style={globalStyles.input} />
            </View>

            <View>
              <Text style={globalStyles.inputLabel}>Ícone</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={icon}
                  onValueChange={(value) => setIcon(value)}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <Text style={globalStyles.inputLabel}>Cor</Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setBackground(c)}
                    style={[styles.colorDot, { backgroundColor: c },
                      background === c && styles.colorDotSelected]} />
                ))}
              </View>
            </View>

            <Button onPress={handleCreate} disabled={submitting}>
              {submitting ? "Salvando..." : "Adicionar categoria"}
            </Button>

            <View style={[globalStyles.line, { marginTop: 16 }]} />
            <Text style={styles.sectionTitle}>Categorias cadastradas</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.categoryRow}>
            <CategoryItem category={item} />
            <View style={styles.categoryInfo}>
              <Text style={globalStyles.primaryText}>{item.displayName}</Text>
              <Text style={globalStyles.secondaryText}>
                {item.isDefault ? "padrão" : "personalizada"}
                {item.isIncome ? " · receita" : ""}
              </Text>
            </View>
            {!item.isDefault && (
              <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
                <MaterialIcons name="delete-outline" size={24} color={colors.negativeText} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent:      { paddingVertical: 12, paddingHorizontal: 20, gap: 12 },
  formContainer:    { gap: 12, marginBottom: 8 },
  sectionTitle:     { fontSize: 16, fontWeight: "700", color: colors.primaryText, marginTop: 4 },
  categoryRow:      { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  categoryInfo:     { flex: 1 },
  colorRow:         { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorDot:         { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "transparent" },
  colorDotSelected: { borderColor: colors.primaryText },
  center:           { flex: 1, alignItems: "center", justifyContent: "center" },
  picker: {
    height: 44,
    borderColor: colors.secondaryText,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
  },
});