// 투표 제목·설명·선택지는 이 파일만 수정하면 됩니다. (10~15개 권장)
export const poll = {
  title: "2026 하반기 워크숍 장소 투표",
  description: "가장 가고 싶은 장소 하나를 골라 주세요. 다시 제출하면 이전 투표가 바뀝니다.",
  options: [
    { id: "jeju", label: "제주" },
    { id: "busan", label: "부산" },
    { id: "gangneung", label: "강릉" },
    { id: "sokcho", label: "속초" },
    { id: "yeosu", label: "여수" },
    { id: "gyeongju", label: "경주" },
    { id: "jeonju", label: "전주" },
    { id: "tongyeong", label: "통영" },
    { id: "chuncheon", label: "춘천" },
    { id: "pohang", label: "포항" },
    { id: "damyang", label: "담양" },
    { id: "ulleung", label: "울릉도" },
  ],
} as const;

export type PollOption = { id: string; label: string };
