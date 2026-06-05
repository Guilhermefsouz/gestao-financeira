import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { colors } from "../constants/colors";
import GlobalState, { MoneyContext } from "../contexts/GlobalState";

function RootLayoutInner() {
  const { user } = useContext(MoneyContext);
  const segments = useSegments();

  const inTabs  = segments[0] === "(tabs)";
  const inLogin = segments[0] === "login";

  return (
    <>
      <StatusBar backgroundColor={colors.primary} style="light" />
      <Stack>
        <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
        <Stack.Screen name="login"      options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {!user && !inLogin && <Redirect href="/login" />}
      {user  && inLogin  && <Redirect href="/"     />}
    </>
  );
}

export default function RootLayout() {
  return (
    <GlobalState>
      <RootLayoutInner />
    </GlobalState>
  );
}