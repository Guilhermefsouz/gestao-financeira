import { Text, TextInput, View } from "react-native"
import { globalStyles } from "../styles/globalStyles"

export default function DescriptionInput({ form, setForm, valueInputRef }) {
  return (
    <View>
      <Text style={globalStyles.inputLabel}>Descrição</Text>
      <TextInput
        value={form.description}
        returnKeyType="next"
        autoFocus={true}
        autoCorrect={false}
        autoCapitalize="sentences"
        onChangeText={(text) => setForm({ ...form, description: text })}
        onSubmitEditing={() => valueInputRef.current?.focus()}
        style={globalStyles.input}
      />
    </View>
  )
}