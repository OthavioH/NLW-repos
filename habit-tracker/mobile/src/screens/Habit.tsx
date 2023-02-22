import { ScrollView, View, Text, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { BackButton } from "../components/BackButton";
import { ProgressBar } from "../components/ProgressBar";
import { CheckBox } from "../components/Checkbox";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { Loading } from "../components/loading";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import { HabitsEmpty } from "../components/HabitsEmpty";
import clsx from "clsx";

interface Params {
  date: string;
}

interface DayInfoProps {
  completedHabits: string[];
  possibleHabits: {
    id: string;
    title: string;
    created_at: string;
  }[];
}

export function Habit() {
  const [loading, setLoading] = useState(false);
  const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const route = useRoute();
  const { date } = route.params as Params;

  const parsedDate = dayjs(date);
  const isDateInPast = parsedDate.isBefore(dayjs(), "day");
  const dayOfWeek = parsedDate.format("dddd");
  const dayAndMonth = parsedDate.format("DD/MM");

  async function fetchHabits() {
    try {
      setLoading(true);
      const response = await api.get("/day", {
        params: {
          date,
        },
      });
      setDayInfo(response.data);
      setCompletedHabits(response.data.completedHabits);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Vish...",
        "Não deu pra atualizar o hábito, vai ficar sem hoje"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleHabit(habidId: string) {
    try {
      await api.patch(`/habits/${habidId}/toggle`);
      if (completedHabits.includes(habidId)) {
        setCompletedHabits((prevState) =>
          prevState.filter((habit) => habit !== habidId)
        );
      } else {
        setCompletedHabits((prevState) => [...prevState, habidId]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Ops...", "Não foi possível atualizar esse hábito");
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const progressPercentage = dayInfo?.possibleHabits.length
    ? generateProgressPercentage(
        dayInfo!.possibleHabits.length,
        completedHabits.length
      )
    : 0;

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>

        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={progressPercentage} />

        <View
          className={clsx("mt-6", {
            "opacity-50": isDateInPast,
          })}
        >
          {dayInfo?.possibleHabits ? (
            dayInfo!.possibleHabits.map((habit) => (
              <CheckBox
                key={habit.id}
                title={habit.title}
                disabled={isDateInPast}
                checked={completedHabits.includes(habit.id)}
                onPress={() => handleToggleHabit(habit.id)}
              />
            ))
          ) : (
            <HabitsEmpty />
          )}
        </View>

        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos do passado
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
