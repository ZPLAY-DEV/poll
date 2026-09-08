// 투표 제목·설명·선택지는 이 파일만 수정하면 됩니다. (10~15개 권장)
export const poll = {
  title: "강사플랫폼 브랜드명 투표",
  description: "가장 마음에 드는 브랜드명 하나를 골라 주세요.",
  options: [
    { id: "ssamitzy", label: "쌤잇지", note: "ssamitzy.com" },
    { id: "samitda", label: "쌤잇다", note: "samitda.com" },
    { id: "ssamhub", label: "쌤허브", note: "ssamhub.com" },
    { id: "samz", label: "쌤즈", note: "samz.kr" },
    { id: "zacademy", label: "제트아카데미", note: "zacademy.kr" },
    { id: "z-on", label: "제트온", note: "z-on.kr" },
    { id: "z-teacher", label: "제트티쳐", note: "z-teacher.com" },
    { id: "z-class", label: "제트클래스", note: "z-class.kr" },
    { id: "teacherlink", label: "티쳐링크", note: "teacherlink.kr" },
    { id: "ohmyssam", label: "오마이쌤", note: "ohmyssam.com" },
  ],
} as const;

export type PollOption = { id: string; label: string; note?: string };
