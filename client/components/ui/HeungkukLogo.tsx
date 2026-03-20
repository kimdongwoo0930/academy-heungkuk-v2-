interface Props {
  size?: number;
}

export default function HeungkukLogo({ size = 36 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 왼쪽 위 사각형 */}
      <rect x="5" y="8" width="26" height="26" fill="#EC008C" />
      {/* 왼쪽 아래 사각형 */}
      <rect x="5" y="42" width="26" height="26" fill="#EC008C" />
      {/* 오른쪽 다이아몬드 — 사각형 두 개와 세로 높이 맞춤 */}
      <rect
        x="45"
        y="17"
        width="42"
        height="42"
        transform="rotate(45 66 38)"
        fill="#EC008C"
      />
    </svg>
  );
}
