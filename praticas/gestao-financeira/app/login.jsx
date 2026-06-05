import { router } from "expo-router";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";
import { globalStyles } from "../styles/globalStyles";
 
export default function LoginScreen() {
  const { login, register } = useContext(MoneyContext);
 
  const [mode, setMode]         = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
 
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Preencha e-mail e senha.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      Alert.alert("Informe seu nome.");
      return;
    }
 
    setLoading(true);
    try {
      if (mode === "register") {
        await register({ name: name.trim(), email: email.trim(), password });
        Alert.alert("Conta criada!", "Agora faça login com suas credenciais.");
        setMode("login");
        setName("");
      } else {
        await login({ email: email.trim(), password });
        router.replace("/");
      }
    } catch (e) {
      const msg =
        e.message?.includes("401") || e.message?.includes("Credenciais")
          ? "E-mail ou senha incorretos."
          : e.message ?? "Erro inesperado.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialIcons
              name="account-balance-wallet"
              size={40}
              color={colors.primaryContrast}
            />
          </View>
          <Text style={styles.appName}>Gestão Financeira</Text>
          <Text style={styles.subtitle}>
            {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </Text>
        </View>
 
        {/* Formulário */}
        <View style={styles.form}>
          {mode === "register" && (
            <View>
              <Text style={globalStyles.inputLabel}>Nome</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                autoCapitalize="words"
                style={globalStyles.input}
              />
            </View>
          )}
 
          <View>
            <Text style={globalStyles.inputLabel}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={globalStyles.input}
            />
          </View>
 
          <View>
            <Text style={globalStyles.inputLabel}>Senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••"
                secureTextEntry={!showPass}
                style={[globalStyles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
              >
                <MaterialIcons
                  name={showPass ? "visibility-off" : "visibility"}
                  size={22}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>
          </View>
 
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryContrast} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === "login" ? "Entrar" : "Criar conta"}
              </Text>
            )}
          </TouchableOpacity>
 
          <TouchableOpacity
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          >
            <Text style={styles.switchText}>
              {mode === "login"
                ? "Não tem conta? Cadastre-se"
                : "Já tem conta? Entrar"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primaryText,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  form: {
    gap: 14,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eyeBtn: {
    padding: 8,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: colors.primaryContrast,
    fontSize: 17,
    fontWeight: "700",
  },
  switchText: {
    textAlign: "center",
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});