import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Terminal, Bell, Palette, MessageSquare, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/stores/appStore";
import { BIRTH_LOCATIONS } from "@/types";
import { getZodiacSign } from "@/lib/zodiac";
import { getBirthDayMaster } from "@/lib/saju";
import { sendToSlack } from "@/lib/slack";
import type { UserProfile } from "@/types";

const settingsSchema = z.object({
  notificationTime: z.string(),
  jobRole: z.enum(["general", "developer", "designer", "pm"]),
  tone: z.enum(["warm", "savage", "hype", "calm"]),
  theme: z.enum(["auto", "light", "dark"]),
  slackWebhookUrl: z.string(),
  slackAutoShare: z.boolean(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  birthLocationName: z.string(),
});

type SettingsData = z.infer<typeof settingsSchema>;

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-strong rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gold/15 flex items-center justify-center">
          <Icon className="w-3 h-3 text-gold" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { profile, preferences, fortune, updatePreferences, setProfile, setView, resetAll } =
    useAppStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      notificationTime: preferences.notificationTime,
      jobRole: preferences.jobRole,
      tone: preferences.tone,
      theme: preferences.theme,
      slackWebhookUrl: preferences.slack.webhookUrl,
      slackAutoShare: preferences.slack.autoShareOnNotification,
      birthDate: profile?.birthDate ?? "",
      birthTime: profile?.birthTime ?? "12:00",
      birthLocationName: profile?.birthLocation.name ?? "서울",
    },
  });

  const onSubmit = async (data: SettingsData) => {
    const styleChanged = data.tone !== preferences.tone || data.jobRole !== preferences.jobRole;

    await updatePreferences({
      notificationTime: data.notificationTime,
      jobRole: data.jobRole,
      tone: data.tone,
      theme: data.theme,
      slack: {
        webhookUrl: data.slackWebhookUrl,
        autoShareOnNotification: data.slackAutoShare,
      },
    });

    const profileChanged = profile && (
      data.birthDate !== profile.birthDate ||
      data.birthTime !== profile.birthTime ||
      data.birthLocationName !== profile.birthLocation.name
    );

    if (profileChanged) {
      const location = BIRTH_LOCATIONS.find(l => l.name === data.birthLocationName) ?? BIRTH_LOCATIONS[0];
      const [, month, day] = data.birthDate.split("-").map(Number);
      const zodiacSign = getZodiacSign(month, day);
      const dayMaster = getBirthDayMaster(data.birthDate);

      const updatedProfile: UserProfile = {
        ...profile,
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthLocation: location,
        dayMaster: dayMaster.fullName,
        dayMasterHanja: dayMaster.stemHanja,
        zodiacSign,
      };
      await setProfile(updatedProfile);
    }

    setView("home");

    if (profileChanged || styleChanged) {
      useAppStore.getState().fetchFortune(true);
    }
  };

  const handleTestSlack = async () => {
    const url = (document.getElementById("slackWebhookUrl") as HTMLInputElement)?.value;
    if (url && fortune) {
      const ok = await sendToSlack(url, fortune);
      alert(ok ? "전송 성공!" : "전송 실패. URL을 확인해주세요.");
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-3 border-b border-border/50"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setView("home")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold text-sm">설정</h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        <Section icon={User} title="프로필">
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="birthDate" className="text-xs">생년월일</Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="birthTime" className="text-xs">출생 시간</Label>
                <Input id="birthTime" type="time" {...register("birthTime")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="birthLocationName" className="text-xs">출생 도시</Label>
                <Select
                  id="birthLocationName"
                  {...register("birthLocationName")}
                  options={BIRTH_LOCATIONS.map(l => ({ value: l.name, label: l.name }))}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Palette} title="운세 설정">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="jobRole" className="text-xs">직군</Label>
                <Select
                  id="jobRole"
                  {...register("jobRole")}
                  options={[
                    { value: "general", label: "기본" },
                    { value: "developer", label: "개발자" },
                    { value: "designer", label: "디자이너" },
                    { value: "pm", label: "기획자/PM" },
                  ]}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tone" className="text-xs">말투</Label>
                <Select
                  id="tone"
                  {...register("tone")}
                  options={[
                    { value: "warm", label: "따뜻한" },
                    { value: "savage", label: "독설" },
                    { value: "hype", label: "하이텐션" },
                    { value: "calm", label: "차분한" },
                  ]}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="theme" className="text-xs">테마</Label>
              <Select
                id="theme"
                {...register("theme")}
                options={[
                  { value: "auto", label: "자동" },
                  { value: "light", label: "라이트" },
                  { value: "dark", label: "다크" },
                ]}
              />
            </div>
          </div>
        </Section>

        <Section icon={Bell} title="알림">
          <div className="space-y-1">
            <Label htmlFor="notificationTime" className="text-xs">알림 시간</Label>
            <Input id="notificationTime" type="time" {...register("notificationTime")} />
          </div>
        </Section>

        <Section icon={Terminal} title="Claude CLI">
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-[11px] text-primary">로컬 Claude CLI 사용</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Claude Max 플랜으로 로그인된 CLI를 사용합니다.
              터미널에서 <code className="bg-muted px-1 rounded">claude</code> 명령어가 동작하는지 확인하세요.
            </p>
          </div>
        </Section>

        <Section icon={MessageSquare} title="Slack 연동">
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="slackWebhookUrl" className="text-xs">Webhook URL</Label>
              <Input
                id="slackWebhookUrl"
                placeholder="https://hooks.slack.com/..."
                {...register("slackWebhookUrl")}
                className="text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                {...register("slackAutoShare")}
                className="accent-primary rounded"
              />
              매일 알림 시 자동 공유
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-lg text-xs h-8"
              onClick={handleTestSlack}
            >
              테스트 메시지 보내기
            </Button>
          </div>
        </Section>

        <Button
          type="submit"
          className="w-full h-10 rounded-xl bg-gold/90 hover:bg-gold text-background font-semibold shadow-lg shadow-black/20 hover:shadow-xl transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full h-9 rounded-xl text-xs text-muted-foreground hover:text-red-500"
          onClick={() => {
            if (confirm("모든 설정과 데이터를 초기화하고 처음부터 다시 시작할까요?")) {
              resetAll();
            }
          }}
        >
          <RotateCcw className="w-3 h-3 mr-1.5" />
          초기화 (처음부터 다시 설정)
        </Button>

        <p className="text-center text-[10px] text-muted-foreground pb-1">
          Vibe v0.1.0
        </p>
      </form>
    </div>
  );
}
