import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const SIZE   = Dimensions.get("window").width * 0.55;
const RADIUS = SIZE / 2 - 8;
const CX     = SIZE / 2;
const CY     = SIZE / 2;

export default function PieChart({ slices }) {
  if (!slices?.length) return null;

  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  let startAngle = -Math.PI / 2;

  const paths = slices.map((sl) => {
    const ratio = sl.value / total;
    // Se for 100%, força um ângulo ligeiramente menor para o SVG renderizar
    const angle    = ratio >= 1 ? Math.PI * 1.9999 : ratio * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = CX + RADIUS * Math.cos(startAngle);
    const y1 = CY + RADIUS * Math.sin(startAngle);
    const x2 = CX + RADIUS * Math.cos(endAngle);
    const y2 = CY + RADIUS * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${CX} ${CY}`,
      `L ${x1} ${y1}`,
      `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const midAngle = startAngle + angle / 2;
    const lx  = CX + RADIUS * 0.65 * Math.cos(midAngle);
    const ly  = CY + RADIUS * 0.65 * Math.sin(midAngle);
    const pct = Math.round(ratio * 100);

    startAngle = endAngle;

    return { d, color: sl.color, label: sl.label, value: sl.value, pct, lx, ly };
  });

  return (
    <View style={styles.wrapper}>
      <Svg width={SIZE} height={SIZE}>
        <G>
          {paths.map((p, i) => (
            <Path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth={2} />
          ))}
          {paths.map((p, i) =>
            p.pct >= 5 ? (
              <SvgText
                key={`lbl-${i}`}
                x={p.lx}
                y={p.ly}
                textAnchor="middle"
                fontSize={12}
                fontWeight="700"
                fill="#fff"
              >
                {p.pct}%
              </SvgText>
            ) : null
          )}
          <Circle cx={CX} cy={CY} r={RADIUS * 0.38} fill="#F5F5F5" />
        </G>
      </Svg>

      <View style={styles.legend}>
        {paths.map((p, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: p.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {p.label}
            </Text>
            <Text style={styles.legendValue}>
              {p.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:     { alignItems: "center", width: "100%", gap: 12 },
  legend:      { width: "100%", gap: 6 },
  legendItem:  { flexDirection: "row", alignItems: "center", gap: 8 },
  dot:         { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: 13, color: "#666" },
  legendValue: { fontSize: 13, fontWeight: "600", color: "#666" },
});