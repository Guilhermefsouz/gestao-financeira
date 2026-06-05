import { useContext, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../../contexts/GlobalState";
import SummaryItem from "../../components/SummaryItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import PieChart from "../../components/PieChart";

const MONTHS = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez",
];

export default function Summary() {
  const { transactions, categories, loading, filter, setFilter } =
    useContext(MoneyContext);

  const { totalsById, balance, chartSlices, sortedCategories } = useMemo(() => {
    const acc = {};
    let saldo = 0;

    for (const c of categories) acc[c.id] = 0;

    for (const t of transactions) {
      const v = Number(t.value);
      if (acc[t.categoryId] !== undefined) acc[t.categoryId] += v;
      const cat = t.category ?? categories.find((c) => c.id === t.categoryId);
      saldo += cat?.isIncome ? v : -v;
    }

    const slices = categories
      .filter((c) => acc[c.id] > 0)
      .map((c) => ({ label: c.displayName, value: acc[c.id], color: c.background }));

    const sorted = [...categories].sort((a, b) => {
      if (a.isIncome && !b.isIncome) return -1;
      if (!a.isIncome && b.isIncome) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return { totalsById: acc, balance: saldo, chartSlices: slices, sortedCategories: sorted };
  }, [transactions, categories]);

  const prevMonth = () =>
    setFilter((f) => {
      const d = new Date(f.year, f.month - 2, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

  const nextMonth = () =>
    setFilter((f) => {
      const d = new Date(f.year, f.month, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

  if (loading && categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const balanceStyle =
    balance >= 0 ? globalStyles.positiveText : globalStyles.negativeText;

  return (
    <View style={globalStyles.screenContainer}>
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

      <ScrollView style={globalStyles.content}>
        {/* Gráfico de pizza */}
        {chartSlices.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Distribuição por categoria</Text>
            <PieChart slices={chartSlices} />
          </View>
        )}

        {/* Lista por categoria — renda primeiro */}
        {sortedCategories.map((category) => (
          <SummaryItem
            key={category.id}
            category={category}
            value={totalsById[category.id] ?? 0}
          />
        ))}

        <View style={globalStyles.line} />
        <View style={styles.balance}>
          <Text style={styles.balanceText}>Saldo</Text>
          <Text style={balanceStyle}>
            {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  monthFilter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondaryText + "33",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryText,
    minWidth: 100,
    textAlign: "center",
  },
  chartContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondaryText,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  balance: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 24,
  },
  balanceText: {
    fontSize: 18,
    color: colors.primaryText,
    fontWeight: "800",
  },
});