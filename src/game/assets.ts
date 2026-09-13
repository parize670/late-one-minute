export interface GameAssets {
  room: HTMLImageElement;
  elevator: HTMLImageElement;
  title: HTMLImageElement;
  alarm: HTMLImageElement;
  shoeL: HTMLImageElement;
  shoeR: HTMLImageElement;
  badge: HTMLImageElement;
  cat: HTMLImageElement[];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadAssets(): Promise<GameAssets> {
  const [room, elevator, title, alarm, shoeL, shoeR, badge, c1, c2, c3, c4] =
    await Promise.all([
      loadImage("/game/room.jpg"),
      loadImage("/game/elevator.jpg"),
      loadImage("/game/title.jpg"),
      loadImage("/game/alarm.png"),
      loadImage("/game/shoe-left.png"),
      loadImage("/game/shoe-right.png"),
      loadImage("/game/badge.png"),
      loadImage("/game/cat-1.png"),
      loadImage("/game/cat-2.png"),
      loadImage("/game/cat-3.png"),
      loadImage("/game/cat-4.png"),
    ]);
  return {
    room,
    elevator,
    title,
    alarm,
    shoeL,
    shoeR,
    badge,
    cat: [c1, c2, c3, c4],
  };
}
