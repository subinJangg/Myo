import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/stores/appStore";
import { getZodiacSign } from "@/lib/zodiac";
import { getBirthDayMaster } from "@/lib/saju";
import { BIRTH_LOCATIONS } from "@/types";
import type { JobRole, Tone, UserProfile } from "@/types";
import { Sparkles, Briefcase, Code2, Palette, BarChart3, MessageCircle, Flame, Zap, Leaf, Heart } from "lucide-react";

const schema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식으로 입력"),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM 형식으로 입력"),
  birthLocationName: z.string(),
  jobRole: z.enum(["general", "developer", "designer", "pm"]),
  tone: z.enum(["default", "warm", "savage", "hype", "calm"]),
  notificationTime: z.string().regex(/^\d{2}:\d{2}$/),
});

type FormData = z.infer<typeof schema>;

const jobRoleOptions = [
  { value: "general" as const, label: "기본", desc: "일상적인 운세", icon: Briefcase },
  { value: "developer" as const, label: "개발자", desc: "merge conflict 조심하세요", icon: Code2 },
  { value: "designer" as const, label: "디자이너", desc: "오늘의 컬러 팔레트는...", icon: Palette },
  { value: "pm" as const, label: "기획자/PM", desc: "스프린트 리뷰 준비 됐나요?", icon: BarChart3 },
];

const toneOptions = [
  { value: "default" as const, label: "기본", desc: "친절하고 자연스러운 톤", icon: MessageCircle },
  { value: "warm" as const, label: "따뜻한", desc: "힘이 되는 응원 말투", icon: Heart },
  { value: "savage" as const, label: "독설", desc: "팩트로 때리는 애정 어린 독설", icon: Flame },
  { value: "hype" as const, label: "하이텐션", desc: "에너지 넘치는 과장 말투!!", icon: Zap },
  { value: "calm" as const, label: "차분한", desc: "명상적이고 깊이 있는 톤", icon: Leaf },
];

export function OnboardingPage() {
  const { setProfile, updatePreferences } = useAppStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      birthDate: "",
      birthTime: "12:00",
      birthLocationName: "서울",
      jobRole: "general",
      tone: "warm",
      notificationTime: "08:00",
    },
  });

  const selectedJobRole = watch("jobRole");
  const selectedTone = watch("tone");

  const onSubmit = async (data: FormData) => {
    const location = BIRTH_LOCATIONS.find(
      (l) => l.name === data.birthLocationName,
    ) ?? BIRTH_LOCATIONS[0];

    const [, month, day] = data.birthDate.split("-").map(Number);
    const zodiacSign = getZodiacSign(month, day);
    const dayMaster = getBirthDayMaster(data.birthDate);

    const profile: UserProfile = {
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      birthLocation: location,
      dayMaster: dayMaster.fullName,
      dayMasterHanja: dayMaster.stemHanja,
      zodiacSign,
      createdAt: new Date().toISOString(),
    };

    await setProfile(profile);
    await updatePreferences({
      jobRole: data.jobRole as JobRole,
      tone: data.tone as Tone,
      notificationTime: data.notificationTime,
    });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header with gradient */}
      <div className="gradient-primary px-5 pt-6 pb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-2 left-8 text-white/30 text-2xl animate-float">✦</div>
          <div className="absolute top-4 right-10 text-white/20 text-lg animate-float" style={{ animationDelay: "0.5s" }}>✧</div>
          <div className="absolute bottom-3 left-1/3 text-white/25 text-xl animate-float" style={{ animationDelay: "1s" }}>✦</div>
        </div>
        <div className="relative">
          <Sparkles className="w-8 h-8 text-white/90 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-white tracking-tight">Vibe</h1>
          <p className="text-white/70 text-xs mt-1">
            매일 아침, 당신만의 운세를 확인하세요
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto px-4 -mt-4 pb-4 space-y-4"
      >
        {/* Birth info card */}
        <div className="glass-strong rounded-2xl p-4 space-y-3 shadow-lg">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            생년월일시
          </h2>

          <div className="space-y-1">
            <Label htmlFor="birthDate" className="text-xs">생년월일</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} />
            {errors.birthDate && (
              <p className="text-destructive text-[10px]">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="birthTime" className="text-xs">출생 시간</Label>
              <Input id="birthTime" type="time" {...register("birthTime")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="birthLocationName" className="text-xs">출생 도시</Label>
              <Select
                id="birthLocationName"
                {...register("birthLocationName")}
                options={BIRTH_LOCATIONS.map((l) => ({
                  value: l.name,
                  label: l.name,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Job role selection */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
            직군
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {jobRoleOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedJobRole === role.value;
              return (
                <label
                  key={role.value}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "gradient-primary text-white shadow-lg shadow-primary/25 scale-[1.02]"
                      : "glass hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={role.value}
                    {...register("jobRole")}
                    className="sr-only"
                  />
                  <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                  <div className={`text-xs font-medium ${isSelected ? "text-white" : ""}`}>
                    {role.label}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Tone selection */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
            말투
          </h2>
          <div className="space-y-2">
            {toneOptions.map((tone) => {
              const Icon = tone.icon;
              const isSelected = selectedTone === tone.value;
              return (
                <label
                  key={tone.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "gradient-primary text-white shadow-lg shadow-primary/25 scale-[1.02]"
                      : "glass hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={tone.value}
                    {...register("tone")}
                    className="sr-only"
                  />
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-white/20" : "bg-secondary"
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isSelected ? "text-white" : ""}`}>
                      {tone.label}
                    </div>
                    <div className={`text-[11px] truncate ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                      {tone.desc}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-white" : "border-muted-foreground/30"
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Notification time */}
        <div className="glass-strong rounded-2xl p-4 space-y-1">
          <Label htmlFor="notificationTime" className="text-xs">아침 알림 시간</Label>
          <Input
            id="notificationTime"
            type="time"
            {...register("notificationTime")}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.01]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              설정 중...
            </div>
          ) : (
            "시작하기"
          )}
        </Button>
      </form>
    </div>
  );
}
