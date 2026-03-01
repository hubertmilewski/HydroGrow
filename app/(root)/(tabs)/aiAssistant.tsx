import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import axios from "axios";
import { ref, get } from "firebase/database";
import { database } from "../../../src/config/firebaseConfig";
import { v4 as uuidv4 } from "uuid";

const HUGGINGFACE_API_KEY = "";
const HUGGINGFACE_MODEL = "";

export default function HydroponicsAssistant() {
    const [messages, setMessages] = useState<
        Array<{
            id: string;
            text: string;
            isUser: boolean;
        }>
    >([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentTemperature, setCurrentTemperature] = useState<number | null>(
        null
    );
    const [plantData, setPlantData] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const sampleQuestions = [
        "Jaka jest aktualna temperatura?",
        "Jakie jest zalecane stężenie azotu?",
        "Jakie są objawy niedoboru magnezu?",
        "Jak wpływa fosfor na wzrost roślin?",
        "Jakie jest zalecane pH dla hydroponiki?",
        "Jakie są objawy nadmiaru potasu?",
        "Jakie jest zalecane EC dla hydroponiki?",
    ];

    useEffect(() => {
        setMessages([
            {
                id: uuidv4(), // Unikalny identyfikator dla początkowej wiadomości
                text: "Witaj w asystencie hydroponicznym! Mogę pomóc z informacjami o temperaturze, nawozach i ich wpływie na wzrost roślin. Co chcesz wiedzieć?",
                isUser: false,
            },
        ]);

        fetchTemperature();
        fetchPlantData();
    }, []);

    const fetchTemperature = async () => {
        try {
            const tempData = await getTemperatureData();
            const tempMatch = tempData.match(/(\d+(\.\d+)?)/);
            if (tempMatch && tempMatch[0]) {
                setCurrentTemperature(parseFloat(tempMatch[0]));
            }
        } catch (error) {
            console.error("Błąd pobierania temperatury:", error);
        }
    };

    const fetchPlantData = async () => {
        try {
            const snapshot = await get(ref(database, "plants_data"));
            if (snapshot.exists()) {
                setPlantData(snapshot.val());
            }
        } catch (error) {
            console.error("Błąd pobierania danych o roślinach:", error);
        }
    };

    const getTemperatureData = async () => {
        try {
            const snapshot = await get(ref(database, "sensor_data"));
            if (!snapshot.exists()) throw new Error("Brak danych w bazie");

            const data = snapshot.val();
            const entries = Object.values(data) as Array<{
                temperature_ds18b20?: number;
                time?: string;
            }>;

            const latest = entries
                .reverse()
                .find((e) => e.temperature_ds18b20 && e.time);

            if (!latest) throw new Error("Brak danych o temperaturze");
            return `Aktualna temperatura: ${latest.temperature_ds18b20}°C (${latest.time})`;
        } catch (error) {
            console.error("Błąd odczytu czujnika:", error);
            throw error;
        }
    };

    const analyzeNutrientEffect = (query: string): string | null => {
        const nutrients = {
            azot: {
                effect: "przyspiesza wzrost liści i łodyg",
                dosage: "100-200 ppm",
                deficiency: "żółknięcie starszych liści, wolniejszy wzrost",
                excess: "nadmierny wzrost liści kosztem korzeni i owoców, większa podatność na choroby",
            },
            fosfor: {
                effect: "wspomaga rozwój korzeni i kwitnienie",
                dosage: "30-50 ppm",
                deficiency:
                    "ciemnozielone liście z fioletowym odcieniem, słaby rozwój korzeni",
                excess: "może blokować przyswajanie innych składników jak żelazo i cynk",
            },
            potas: {
                effect: "reguluje gospodarkę wodną, wzmacnia odporność",
                dosage: "100-200 ppm",
                deficiency: "brązowienie brzegów liści, słaba jakość owoców",
                excess: "może utrudniać przyswajanie magnezu i wapnia",
            },
            wapń: {
                effect: "wzmacnia ściany komórkowe, poprawia strukturę",
                dosage: "100-200 ppm",
                deficiency:
                    "zniekształcenie młodych liści, zgnilizna wierzchołkowa owoców",
                excess: "może podnosić pH roztworu i blokować przyswajanie mikroelementów",
            },
            magnez: {
                effect: "kluczowy dla fotosyntezy",
                dosage: "30-50 ppm",
                deficiency:
                    "żółknięcie między żyłkami liści, rozpoczynające się od starszych liści",
                excess: "rzadko występuje, może konkurować z wapniem i potasem",
            },
            żelazo: {
                effect: "niezbędne do produkcji chlorofilu",
                dosage: "2-5 ppm",
                deficiency:
                    "żółknięcie między żyłkami młodych liści (chloroza)",
                excess: "brązowe plamy na liściach, zahamowanie wzrostu",
            },
            "chelat żelaza": {
                effect: "łatwo przyswajalną formą żelaza, zapobiega chlorozie",
                dosage: "2-5 ppm",
                deficiency:
                    "żółknięcie między żyłkami młodych liści (chloroza)",
                excess: "brązowe plamy na liściach, zahamowanie wzrostu",
            },
            "siarczan magnezu": {
                effect: "dostarcza magnez i siarkę, poprawia fotosyntezę",
                dosage: "30-50 ppm magnezu",
                deficiency: "żółknięcie między żyłkami liści",
                excess: "może powodować nadmiar siarki i obniżenie pH",
            },
            mikroelementy: {
                effect: "kompleksowe wsparcie procesów metabolicznych",
                dosage: "zależna od konkretnego mikroelementu",
                deficiency: "różne objawy zależne od pierwiastka",
                excess: "toksyczność - często objawy podobne do niedoborów innych składników",
            },
            hydrożel: {
                effect: "poprawia retencję wody, stabilizuje wilgotność",
                dosage: "1-3g na litr substratu",
                deficiency: "nie dotyczy (nie jest składnikiem odżywczym)",
                excess: "może powodować nadmierne zatrzymywanie wody i problemy z napowietrzeniem korzeni",
            },
            "kwas humusowy": {
                effect: "poprawia strukturę podłoża, zwiększa dostępność składników",
                dosage: "50-100 ppm",
                deficiency: "nie dotyczy (jest dodatkiem poprawiającym)",
                excess: "rzadko szkodliwy, może obniżać pH roztworu",
            },
            "ph down": {
                effect: "obniża pH roztworu odżywczego",
                dosage: "zależnie od potrzeby, do osiągnięcia pH 5.5-6.5",
                deficiency: "nie dotyczy",
                excess: "zbyt niskie pH powoduje problemy z przyswajaniem składników i uszkodzenia korzeni",
            },
            "ph up": {
                effect: "podwyższa pH roztworu odżywczego",
                dosage: "zależnie od potrzeby, do osiągnięcia pH 5.5-6.5",
                deficiency: "nie dotyczy",
                excess: "zbyt wysokie pH blokuje przyswajanie mikroelementów",
            },
            ec: {
                effect: "miara zasolenia/stężenia roztworu odżywczego",
                dosage: "1.0-2.5 mS/cm zależnie od fazy wzrostu i gatunku",
                deficiency:
                    "zbyt niskie EC oznacza niedobór składników odżywczych",
                excess: "zbyt wysokie EC może powodować stres osmotyczny i uszkodzenia korzeni",
            },
        };

        let foundNutrient = null;
        const lowerQuery = query.toLowerCase();

        for (const [name, data] of Object.entries(nutrients)) {
            if (lowerQuery.includes(name)) {
                foundNutrient = { name, ...data };
                break;
            }
        }

        if (!foundNutrient) {
            return null;
        }

        let responseType = "general";
        if (
            lowerQuery.includes("dawkow") ||
            lowerQuery.includes("ile") ||
            lowerQuery.includes("stężeni")
        ) {
            responseType = "dosage";
        } else if (
            lowerQuery.includes("niedobór") ||
            lowerQuery.includes("brak")
        ) {
            responseType = "deficiency";
        } else if (
            lowerQuery.includes("nadmiar") ||
            lowerQuery.includes("za dużo")
        ) {
            responseType = "excess";
        } else if (
            lowerQuery.includes("wpływ") ||
            lowerQuery.includes("działanie") ||
            lowerQuery.includes("efekt")
        ) {
            responseType = "effect";
        }

        let response = "";

        switch (responseType) {
            case "dosage":
                response = `Zalecane stężenie ${foundNutrient.name} w roztworze odżywczym to ${foundNutrient.dosage}. ${foundNutrient.effect}.`;
                break;
            case "deficiency":
                response = `Niedobór ${foundNutrient.name} objawia się poprzez: ${foundNutrient.deficiency}. Zalecane stężenie to ${foundNutrient.dosage}.`;
                break;
            case "excess":
                response = `Nadmiar ${foundNutrient.name} może powodować: ${foundNutrient.excess}. Uważaj, aby nie przekraczać zalecanych dawek (${foundNutrient.dosage}).`;
                break;
            case "effect":
                response = `${
                    foundNutrient.name.charAt(0).toUpperCase() +
                    foundNutrient.name.slice(1)
                } ${foundNutrient.effect}. Zalecane stężenie to ${
                    foundNutrient.dosage
                }.`;
                break;
            default:
                response = `${
                    foundNutrient.name.charAt(0).toUpperCase() +
                    foundNutrient.name.slice(1)
                }: ${foundNutrient.effect}. Zalecane stężenie: ${
                    foundNutrient.dosage
                }. Niedobór powoduje ${
                    foundNutrient.deficiency
                }. Nadmiar może prowadzić do ${foundNutrient.excess}.`;
        }

        if (currentTemperature !== null) {
            if (
                foundNutrient.name === "żelazo" ||
                foundNutrient.name === "chelat żelaza"
            ) {
                if (currentTemperature < 18) {
                    response += ` Przy obecnej temperaturze ${currentTemperature}°C przyswajanie żelaza może być utrudnione. Optymalna temperatura to 20-25°C.`;
                }
            } else if (foundNutrient.name === "wapń") {
                if (currentTemperature > 30) {
                    response += ` Przy obecnej temperaturze ${currentTemperature}°C zwróć uwagę na wystarczające nawodnienie, gdyż niedobory wapnia są częstsze przy wysokich temperaturach.`;
                }
            }
        }

        return response;
    };

    const analyzePlantGrowth = (plantName: string): string | null => {
        if (!plantData || !plantData[plantName]) {
            return null;
        }

        const plant = plantData[plantName];
        const growthRate = plant.current_height - plant.initial_height;
        const daysGrowing = Math.floor(
            (Date.now() - plant.start_date) / (1000 * 60 * 60 * 24)
        );
        const dailyGrowth = growthRate / daysGrowing;

        let healthStatus = "dobry";
        if (dailyGrowth < plant.expected_daily_growth * 0.7) {
            healthStatus = "poniżej oczekiwań";
        } else if (dailyGrowth > plant.expected_daily_growth * 1.3) {
            healthStatus = "ponadprzeciętny";
        }

        let recommendation = "";
        if (healthStatus === "poniżej oczekiwań") {
            if (plant.nutrient_level < 70) {
                recommendation =
                    " Zalecenie: zwiększ stężenie składników odżywczych.";
            } else if (
                currentTemperature !== null &&
                (currentTemperature < plant.min_temp ||
                    currentTemperature > plant.max_temp)
            ) {
                recommendation = ` Zalecenie: dostosuj temperaturę (optymalna: ${plant.min_temp}-${plant.max_temp}°C).`;
            } else {
                recommendation =
                    " Zalecenie: sprawdź pH roztworu i poziom oświetlenia.";
            }
        }

        return `${plantName}: wzrost ${growthRate}cm w ciągu ${daysGrowing} dni (${dailyGrowth.toFixed(
            2
        )}cm/dzień). Stan: ${healthStatus}.${recommendation}`;
    };

    const getAIResponse = async (userInput: string) => {
        try {
            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`,
                { inputs: userInput },
                {
                    headers: {
                        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data && response.data.generated_text) {
                return response.data.generated_text;
            } else {
                throw new Error("Nieprawidłowa odpowiedź API");
            }
        } catch (error) {
            console.error("Błąd AI API:", error);
            throw error;
        }
    };

    const getLocalResponse = (userInput: string) => {
        const lowerInput = userInput.toLowerCase();

        if (lowerInput.includes("temperatur")) {
            return "Sprawdzam aktualną temperaturę...";
        } else if (
            lowerInput.includes("czesc") ||
            lowerInput.includes("witaj") ||
            lowerInput.includes("hej")
        ) {
            return "Witaj! W czym mogę pomóc? Mogę sprawdzić aktualną temperaturę lub udzielić informacji o nawozach i ich wpływie na wzrost roślin.";
        } else if (
            lowerInput.includes("dziekuje") ||
            lowerInput.includes("dzieki")
        ) {
            return "Nie ma za co! Czy mogę jeszcze jakoś pomóc?";
        } else if (
            lowerInput.includes("co potrafisz") ||
            lowerInput.includes("co umiesz")
        ) {
            return "Potrafię udzielać informacji o składnikach odżywczych dla roślin hydroponicznych, ich dawkowaniu, objawach niedoboru i nadmiaru. Mogę też sprawdzać aktualną temperaturę i analizować wzrost roślin na podstawie danych z czujników.";
        } else if (
            lowerInput.includes("nawoz") ||
            lowerInput.includes("odżyw")
        ) {
            return "Mogę pomóc z informacjami o różnych składnikach odżywczych jak azot, fosfor, potas, wapń, magnez, żelazo i innych. Zapytaj o konkretny składnik, aby uzyskać szczegółowe informacje.";
        } else if (
            lowerInput.includes("wzrost") ||
            lowerInput.includes("rośnie")
        ) {
            return "Aby uzyskać informacje o wzroście konkretnej rośliny, podaj jej nazwę lub identyfikator. Mogę przeanalizować dane wzrostu i dać zalecenia.";
        } else {
            return "Przepraszam, nie rozumiem pytania. Możesz zapytać o temperaturę, składniki odżywcze dla roślin lub analizę wzrostu konkretnych roślin.";
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
            id: uuidv4(), // Unikalny identyfikator dla wiadomości użytkownika
            text: inputText,
            isUser: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            let botResponse = "";

            const lowerInput = inputText.toLowerCase();

            if (
                lowerInput.includes("temperatur") &&
                !lowerInput.includes("nawoz") &&
                !lowerInput.includes("odżyw")
            ) {
                await fetchTemperature();
                try {
                    botResponse = await getTemperatureData();
                } catch (error) {
                    botResponse =
                        "Nie mogę odczytać danych z czujników temperatury.";
                }
            } else if (
                lowerInput.includes("nawoz") ||
                lowerInput.includes("odżyw") ||
                lowerInput.includes("azot") ||
                lowerInput.includes("fosfor") ||
                lowerInput.includes("potas") ||
                lowerInput.includes("wapń") ||
                lowerInput.includes("magnez") ||
                lowerInput.includes("żelazo") ||
                lowerInput.includes("chelat") ||
                lowerInput.includes("mikroelement") ||
                lowerInput.includes("ec") ||
                lowerInput.includes("ph")
            ) {
                const nutrientInfo = analyzeNutrientEffect(lowerInput);

                if (nutrientInfo) {
                    botResponse = nutrientInfo;
                } else {
                    botResponse =
                        "Dla optymalnego wzrostu roślin hydroponicznych ważne jest utrzymanie właściwego bilansu makro i mikroelementów. Najważniejsze są: azot (N), fosfor (P), potas (K), wapń (Ca), magnez (Mg) i żelazo (Fe). Zapytaj o konkretny składnik, aby uzyskać szczegółowe informacje.";
                }
            } else if (
                (lowerInput.includes("roslin") ||
                    lowerInput.includes("wzrost")) &&
                plantData
            ) {
                let foundPlantAnalysis = null;
                for (const plantName in plantData) {
                    if (lowerInput.includes(plantName.toLowerCase())) {
                        foundPlantAnalysis = analyzePlantGrowth(plantName);
                        break;
                    }
                }

                if (foundPlantAnalysis) {
                    botResponse = foundPlantAnalysis;
                } else {
                    try {
                        botResponse = await getAIResponse(inputText);
                    } catch (error) {
                        botResponse =
                            "Aby uzyskać informacje o konkretnej roślinie, podaj jej nazwę. Mogę analizować dane wzrostu dla roślin monitorowanych w systemie.";
                    }
                }
            } else {
                try {
                    botResponse = await getAIResponse(inputText);
                } catch (error) {
                    botResponse = getLocalResponse(inputText);
                }
            }

            const botMessage = {
                id: uuidv4(), // Unikalny identyfikator dla wiadomości bota
                text: botResponse,
                isUser: false,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Błąd przetwarzania:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: uuidv4(), // Unikalny identyfikator dla komunikatu o błędzie
                    text: "Wystąpił błąd podczas przetwarzania żądania. Spróbuj ponownie później.",
                    isUser: false,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleQuestionClick = (question: string) => {
        setInputText(question);
        handleSend();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() =>
                        scrollViewRef.current?.scrollToEnd()
                    }
                >
                    {messages.map((message) => (
                        <View
                            key={message.id} // Unikalny klucz dla wiadomości
                            style={[
                                styles.messageBubble,
                                message.isUser
                                    ? styles.userBubble
                                    : styles.botBubble,
                            ]}
                        >
                            <Text
                                style={
                                    message.isUser
                                        ? styles.userText
                                        : styles.botText
                                }
                            >
                                {message.text}
                            </Text>
                        </View>
                    ))}

                    {isLoading && (
                        <View style={[styles.messageBubble, styles.botBubble]}>
                            <Text style={styles.botText}>
                                Piszę odpowiedź...
                            </Text>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.sampleQuestionsContainer}>
                    <Text style={styles.sampleQuestionsTitle}>
                        Przykładowe pytania:
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {sampleQuestions.map((question) => (
                            <TouchableOpacity
                                key={question} // Unikalny klucz dla pytania
                                style={styles.sampleQuestionButton}
                                onPress={() =>
                                    handleSampleQuestionClick(question)
                                }
                            >
                                <Text style={styles.sampleQuestionText}>
                                    {question}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Napisz wiadomość..."
                        placeholderTextColor="#666"
                        multiline
                    />

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !inputText.trim() && styles.disabledButton,
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Text style={styles.sendButtonText}>Wyślij</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 240, // Zwiększone, aby uwzględnić inputContainer i sampleQuestionsContainer
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userBubble: {
        alignSelf: "flex-end",
        backgroundColor: "#007bff",
    },
    botBubble: {
        alignSelf: "flex-start",
        backgroundColor: "#fff",
    },
    userText: {
        color: "#fff",
        fontSize: 16,
    },
    botText: {
        color: "#333",
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        position: "absolute",
        bottom: 80, // Przesunięte o 80 jednostek od dołu (dla nawigacji)
        left: 0,
        right: 0,
        height: 80, // Stała wysokość
    },
    input: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 24,
        marginRight: 8,
        fontSize: 16,
    },
    sendButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#007bff",
        borderRadius: 24,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    disabledButton: {
        backgroundColor: "#b3d9ff",
        opacity: 0.7,
    },
    sampleQuestionsContainer: {
        position: "absolute",
        bottom: 160, // Przesunięte nad inputContainer
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    sampleQuestionsTitle: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
        color: "#333",
    },
    sampleQuestionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 16,
        marginRight: 8,
    },
    sampleQuestionText: {
        fontSize: 14,
        color: "#333",
    },
});