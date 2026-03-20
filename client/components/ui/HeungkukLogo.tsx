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
      <rect x="4" y="4" width="42" height="42" fill="#EC008C" />
      {/* 왼쪽 아래 사각형 */}
      <rect x="4" y="54" width="42" height="42" fill="#EC008C" />
      {/* 오른쪽 다이아몬드 */}
      <rect
        x="54"
        y="17"
        width="44"
        height="44"
        transform="rotate(45 76 39)"
        fill="#EC008C"
      />
    </svg>
  );
}
