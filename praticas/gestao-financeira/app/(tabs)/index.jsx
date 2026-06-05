import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../../contexts/GlobalState";
import TransactionItem from "../../components/TransactionItem";
import CategoryPicker from "../../components/CategoryPicker";
import DatePicker from "../../components/DatePicker";
import CurrencyInput from "../../components/CurrencyInput";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

const MONTHS = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez",
];

/**
 * Tela "Transações".
 *
 * - Boas-vindas com nome do usuário autenticado
 * - Filtro de mês/ano
 * - Long-press abre modal de edição ou confirmação de exclusão
 */
export default function Transactions() {
  const {
    user, transactions, categories, loading, error,
    refresh, filter, setFilter,
    updateTransaction, removeTransaction, logout,
  } = useContext(MoneyContext);

  // Modal de edição
  const [editItem, setEditItem]   = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      description: item.description,
      value:       Number(item.value),
      date:        new Date(item.date),
      categoryId:  item.categoryId,
    });
  };

  const closeEdit = () => { setEditItem(null); setSaving(false); };

  const handleSaveEdit = async () => {
    if (!editForm.description?.trim()) {
      Alert.alert("Informe a descrição."); return;
    }
    setSaving(true);
    try {
      await updateTransaction(editItem.id, {
        description: editForm.description.trim(),
        value:       editForm.value,
        date:        editForm.date,
        categoryId:  editForm.categoryId,
      });
      closeEdit();
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message ?? "Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleLongPress = (item) => {
    Alert.alert(
      item.description,
      "O que deseja fazer?",
      [
        { text: "Editar",  onPress: () => openEdit(item) },
        {
          text: "Excluir", style: "destructive",
          onPress: () => Alert.alert(
            "Excluir transação",
            `Excluir "${item.description}"?`,
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Excluir", style: "destructive",
                onPress: async () => {
                  try { await removeTransaction(item.id); }
                  catch (e) { Alert.alert("Erro", e.message); }
                },
              },
            ]
          ),
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  // Navegação de mês
  const prevMonth = () => {
    setFilter((f) => {
      const d = new Date(f.year, f.month - 2, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });
  };
  const nextMonth = () => {
    setFilter((f) => {
      const d = new Date(f.year, f.month, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.secondaryText}>Carregando transações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <Text style={globalStyles.primaryText}>Não foi possível carregar.</Text>
        <Text style={globalStyles.secondaryText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      {/* Boas-vindas */}
      <View style={styles.welcome}>
        <View>
          <Text style={styles.welcomeGreeting}>Olá, {user?.name?.split(" ")[0]} 👋</Text>
          <Text style={globalStyles.secondaryText}>Suas transações do mês</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Filtro mês/ano */}
      <View style={styles.monthFilter}>
        <TouchableOpacity onPress={prevMonth} hitSlop={8}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTHS[filter.month - 1]} {filter.year}
        </Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={8}>
          <MaterialIcons name="chevron-right" size={28} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleLongPress(item)} activeOpacity={0.7}>
            <TransactionItem {...item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[globalStyles.secondaryText, { textAlign: "center", marginTop: 32 }]}>
            Nenhuma transação em {MONTHS[filter.month - 1]}/{filter.year}.
          </Text>
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal de edição */}
      <Modal visible={!!editItem} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar transação</Text>

            <Text style={globalStyles.inputLabel}>Descrição</Text>
            <TextInput
              value={editForm.description}
              onChangeText={(t) => setEditForm((f) => ({ ...f, description: t }))}
              style={globalStyles.input}
            />

            <CurrencyInput
              form={editForm}
              setForm={(next) => setEditForm(next)}
              valueInputRef={{ current: null }}
            />

            <DatePicker
              form={editForm}
              setForm={(next) => setEditForm(next)}
            />

            <CategoryPicker
              form={editForm}
              setForm={(next) => setEditForm(next)}
              categories={categories}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeEdit} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? "Salvando..." : "Salvar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 12, paddingHorizontal: 20, gap: 12 },
  center:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  welcome: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryText,
  },
  logoutBtn: { padding: 6 },
  monthFilter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondaryText + "33",
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryText,
    minWidth: 100,
    textAlign: "center",
  },
  retry: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: { color: colors.primaryContrast, fontWeight: "600" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryText,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondaryText,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: colors.primaryText, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: colors.primaryContrast, fontWeight: "700" },
});
