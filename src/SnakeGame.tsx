import { useEffect, useRef, useState } from "react";

const SIZE = 20; //cell size
const CELLS = 20; //cell number

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const initialSnake: Point[] = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
];

function randomFood(snake: Point[]): Point {
  let point: Point;

  do {
    point = {
      x: Math.floor(Math.random() * CELLS),
      y: Math.floor(Math.random() * CELLS),
    };
  } while (snake.some((p) => p.x === point.x && p.y === point.y));

  return point;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState<Point>(() => randomFood(initialSnake));
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
      };

      const next = keys[e.key];
      if (!next) return;

      e.preventDefault();

      setDirection((current) => {
        if (
          (current === "UP" && next === "DOWN") ||
          (current === "DOWN" && next === "UP") ||
          (current === "LEFT" && next === "RIGHT") ||
          (current === "RIGHT" && next === "LEFT")
        ) {
          return current;
        }

        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setSnake((currentSnake) => {
        const head = { ...currentSnake[0] };

        switch (direction) {
          case "UP":
            head.y -= 1;
            break;
          case "DOWN":
            head.y += 1;
            break;
          case "LEFT":
            head.x -= 1;
            break;
          case "RIGHT":
            head.x += 1;
            break;
        }

        const hitWall =
          head.x < 0 || head.x >= CELLS || head.y < 0 || head.y >= CELLS;

        const eating = head.x === food.x && head.y === food.y;

        const body = eating ? currentSnake : currentSnake.slice(0, -1);

        const hitSelf = body.some(
          (part) => part.x === head.x && part.y === head.y,
        );

        if (hitWall || hitSelf) {
          setGameOver(true);
          return currentSnake;
        }

        const nextSnake = [head, ...currentSnake];

        if (eating) {
          setScore((s) => s + 10);
          setFood(randomFood(nextSnake));
        } else {
          nextSnake.pop();
        }

        return nextSnake;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [direction, food, gameOver]);

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "#1f2937";
    for (let i = 0; i <= CELLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * SIZE, 0);
      ctx.lineTo(i * SIZE, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * SIZE);
      ctx.lineTo(canvas.width, i * SIZE);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(
      food.x * SIZE + SIZE / 2,
      food.y * SIZE + SIZE / 2,
      SIZE / 2 - 3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Snake
    snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? "#86efac" : "#22c55e";
      ctx.fillRect(part.x * SIZE + 1, part.y * SIZE + 1, SIZE - 2, SIZE - 2);
    });
  }, [snake, food]);

  const restart = () => {
    setSnake(initialSnake);
    setFood(randomFood(initialSnake));
    setDirection("RIGHT");
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-3xl font-bold">Snake Game 🐍</h1>

      <p className="text-lg font-semibold">Score: {score}</p>

      <canvas
        ref={canvasRef}
        width={SIZE * CELLS} // 400
        height={SIZE * CELLS} // 400
        className="rounded-lg border-4 border-gray-700"
      />

      {gameOver && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Game Over!</h2>
          <p>Your score: {score}</p>
        </div>
      )}

      <button
        onClick={restart}
        className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
      >
        {gameOver ? "Play Again" : "Restart"}
      </button>

      <p className="text-sm text-gray-500">Use Arrow Keys to move</p>
    </div>
  );
}
