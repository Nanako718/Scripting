import { Widget, VStack, HStack, Text, Spacer } from "scripting";

const catppuccin = {
  // 亮色使用 Catppuccin Latte，暗色使用 Catppuccin Macchiato
  base: { light: "#eff1f5", dark: "#1e1e2e" } as any,
  mantle: { light: "#e6e9ef", dark: "#181825" } as any,
  text: { light: "#4c4f69", dark: "#cdd6f4" } as any,
  subtext0: { light: "#6c6f85", dark: "#a6adc8" } as any,
  surface0: { light: "#ccd0da", dark: "#313244" } as any,
  green: { light: "#40a02b", dark: "#a6e3a1" } as any,
  mauve: { light: "#8839ef", dark: "#cba6f7" } as any,
  blue: { light: "#1e66f5", dark: "#89b4fa" } as any,
} as const;

function getDayProgress() {
  const now = new Date();
  const done = now.getHours();
  return { done, total: 24 };
}

function getMonthProgress() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  const done = now.getDate();
  return {
    done,
    total,
    month: month + 1,
  };
}

function getYearProgress() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = now.getTime() - start.getTime();
  const done = Math.floor(diff / 86400000) + 1;
  const total = new Date(year, 11, 31).getDate() === 31 ? (isLeapYear(year) ? 366 : 365) : 365;
  return {
    done,
    total,
    year,
  };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function Dot({
  active,
  size = 8,
  cellSize,
  isToday = false,
}: {
  active: boolean;
  size?: number;
  cellSize: number;
  isToday?: boolean;
}) {
  const color = isToday ? catppuccin.mauve : active ? catppuccin.green : catppuccin.surface0;
  return (
    <HStack frame={{ width: cellSize, height: cellSize }} alignment="center">
      <Text font={size} foregroundStyle={color}>
        ●
      </Text>
    </HStack>
  );
}

function DotGrid({
  total,
  done,
  columns,
  dotSize,
  todayIndex,
  gap = 2,
  centered = true,
}: {
  total: number;
  done: number;
  columns: number;
  dotSize: number;
  todayIndex?: number;
  gap?: number;
  centered?: boolean;
}) {
  const safeRows = Math.ceil(total / columns);
  const cellSize = dotSize + gap;
  const gridWidth = columns * cellSize;
  return (
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
      <HStack frame={{ maxWidth: Infinity }}>
        {centered ? <Spacer /> : null}
        <VStack alignment="leading" frame={{ width: gridWidth, maxHeight: Infinity }}>
          {Array.from({ length: safeRows }).map((_, row) => {
            const start = row * columns;
            const count = Math.min(columns, total - start);
            return (
              <VStack key={`row-wrap-${row}`} spacing={0} frame={{ width: gridWidth }}>
                <HStack key={`row-${row}`} spacing={0} frame={{ width: gridWidth }}>
                  {Array.from({ length: columns }).map((__, col) => {
                    if (col >= count) {
                      return <HStack key={`empty-${row}-${col}`} frame={{ width: cellSize, height: cellSize }} />;
                    }
                    const index = start + col + 1;
                    return (
                      <Dot
                        key={`dot-${row}-${col}`}
                        active={index <= done}
                        size={dotSize}
                        cellSize={cellSize}
                        isToday={todayIndex != null && index === todayIndex}
                      />
                    );
                  })}
                </HStack>
                {row < safeRows - 1 ? <Spacer /> : null}
              </VStack>
            );
          })}
        </VStack>
        {centered ? <Spacer /> : null}
      </HStack>
    </VStack>
  );
}

function getGridWidth(columns: number, dotSize: number, gap = 2): number {
  return columns * (dotSize + gap);
}

function FullBackground({
  background,
  children,
}: {
  background: any;
  children: any;
}) {
  return (
    <VStack frame={{ maxWidth: Infinity, maxHeight: Infinity }} background={background}>
      <VStack padding spacing={8} alignment="leading" frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
        {children}
      </VStack>
    </VStack>
  );
}

function GridArea({ children }: { children: any }) {
  return (
    <VStack
      frame={{ maxWidth: Infinity, maxHeight: Infinity }}
      clipShape={{ type: "rect", cornerRadius: 0 }}
    >
      {children}
    </VStack>
  );
}

function TopMeta({ left, right, width }: { left: string; right: string; width: number }) {
  return (
    <HStack frame={{ maxWidth: Infinity }}>
      <Spacer />
      <HStack frame={{ width }} alignment="center">
        <Text font={12} fontWeight="bold" foregroundStyle={catppuccin.text}>
          {left}
        </Text>
        <Spacer />
        <Text font={11} foregroundStyle={catppuccin.subtext0}>
          {right}
        </Text>
      </HStack>
      <Spacer />
    </HStack>
  );
}

function buildSmall() {
  const data = getDayProgress();
  const columns = 8;
  const dotSize = 14;
  const gap = 3;
  const gridWidth = getGridWidth(columns, dotSize, gap);
  return (
    <FullBackground background={catppuccin.base}>
      <TopMeta left="今天" right={`${data.done}/${data.total} 小时`} width={gridWidth} />
      <GridArea>
        <DotGrid
          total={24}
          done={data.done}
          columns={columns}
          dotSize={dotSize}
          gap={gap}
          todayIndex={data.done}
        />
      </GridArea>
    </FullBackground>
  );
}

function buildMedium() {
  const data = getMonthProgress();
  const columns = 15;
  const dotSize = 12;
  const gap = 9;
  const gridWidth = getGridWidth(columns, dotSize, gap);
  return (
    <FullBackground background={catppuccin.mantle}>
      <HStack frame={{ maxWidth: Infinity, maxHeight: Infinity }}>
        <Spacer />
        <VStack frame={{ width: gridWidth, maxHeight: Infinity }} spacing={8} alignment="leading">
          <TopMeta left={`${data.month}月`} right={`${data.done}/${data.total} 天`} width={gridWidth} />
          <GridArea>
            <DotGrid
              total={data.total}
              done={data.done}
              columns={columns}
              dotSize={dotSize}
              todayIndex={data.done}
              gap={gap}
            />
          </GridArea>
        </VStack>
        <Spacer />
      </HStack>
    </FullBackground>
  );
}

function buildLarge() {
  const data = getYearProgress();
  const columns = 30;
  const dotSize = 8;
  const gap = 2;
  const gridWidth = getGridWidth(columns, dotSize, gap);
  return (
    <FullBackground background={catppuccin.base}>
      <TopMeta left={String(data.year)} right={`${data.done}/${data.total} 天`} width={gridWidth} />
      <GridArea>
        <DotGrid total={data.total} done={data.done} columns={columns} dotSize={dotSize} todayIndex={data.done} gap={gap} />
      </GridArea>
    </FullBackground>
  );
}

(async () => {
  switch (Widget.family) {
    case "systemSmall":
      Widget.present(buildSmall());
      break;
    case "systemMedium":
      Widget.present(buildMedium());
      break;
    case "systemLarge":
      Widget.present(buildLarge());
      break;
    default:
      Widget.present(
        <FullBackground background={catppuccin.base}>
          <DotGrid total={24} done={0} columns={6} dotSize={14} />
        </FullBackground>
      );
  }
})();
