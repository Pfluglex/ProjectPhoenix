import { Text, Group, Rect } from 'react-konva';

interface SpaceTagProps {
  x: number;
  y: number;
  width: number;
  depth: number;
  name: string;
  scale: number;
}

export function SpaceTag({ x, y, width, depth, name, scale }: SpaceTagProps) {
  const fontSize = 12 / scale;
  const padding = 4 / scale;
  const lineHeight = fontSize * 1.2;

  // Text content
  const dimensions = `${width}' × ${depth}'`;

  // Calculate text widths (approximate)
  const nameWidth = name.length * fontSize * 0.6;
  const dimWidth = dimensions.length * fontSize * 0.6;
  const tagWidth = Math.max(nameWidth, dimWidth) + padding * 2;
  const tagHeight = lineHeight * 2 + padding * 2;

  return (
    <Group x={x + width / 2} y={y + depth / 2}>
      {/* Background */}
      <Rect
        x={-tagWidth / 2}
        y={-tagHeight / 2}
        width={tagWidth}
        height={tagHeight}
        fill="white"
        opacity={0.9}
        cornerRadius={4 / scale}
        shadowColor="black"
        shadowBlur={4 / scale}
        shadowOpacity={0.2}
        shadowOffset={{ x: 0, y: 2 / scale }}
      />

      {/* Name */}
      <Text
        x={-tagWidth / 2 + padding}
        y={-tagHeight / 2 + padding}
        text={name}
        fontSize={fontSize}
        fontStyle="bold"
        fill="#1f2937"
        width={tagWidth - padding * 2}
        align="center"
      />

      {/* Dimensions */}
      <Text
        x={-tagWidth / 2 + padding}
        y={-tagHeight / 2 + padding + lineHeight}
        text={dimensions}
        fontSize={fontSize * 0.85}
        fill="#6b7280"
        width={tagWidth - padding * 2}
        align="center"
      />
    </Group>
  );
}
