const TMDB = 'https://image.tmdb.org/t/p/w500';

export const ROW_1 = [
  { id: 1, title: 'Interstellar', img: `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg` },
  { id: 2, title: 'Dune', img: `${TMDB}/d5NXSklXo0qyIYkgV94XAgMIckC.jpg` },
  { id: 3, title: 'Blade Runner 2049', img: `${TMDB}/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg` },
  { id: 4, title: 'The Matrix', img: `${TMDB}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg` },
  { id: 5, title: 'Inception', img: `${TMDB}/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg` },
  { id: 6, title: 'The Dark Knight', img: `${TMDB}/qJ2tW6WMUDux911r6m7haRef0WH.jpg` },
  { id: 7, title: 'Oppenheimer', img: `${TMDB}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg` },
  { id: 8, title: 'John Wick', img: `${TMDB}/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg` },
  { id: 9, title: 'Parasite', img: `${TMDB}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg` },
  { id: 10, title: 'Everything Everywhere All at Once', img: `${TMDB}/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg` },
  { id: 12, title: 'Tenet', img: `${TMDB}/k68nPLbIST6NP96JmTxmZijEvCA.jpg` },
  { id: 13, title: 'The Batman', img: `${TMDB}/74xTEgt7R36Fpooo50r9T25onhq.jpg` },
  { id: 14, title: 'Joker', img: `${TMDB}/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg` },
  { id: 15, title: 'Mad Max: Fury Road', img: `${TMDB}/hA2ple9q4qnwxp3hKVNhroipsir.jpg` },
];

export const ROW_2 = [
  { id: 11, title: '1984', img: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg' },
  { id: 12, title: 'The Hobbit', img: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg' },
  { id: 13, title: 'Atomic Habits', img: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg' },
  { id: 14, title: 'Harry Potter', img: 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg' },
  { id: 15, title: 'The Silent Patient', img: 'https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg' },
  { id: 16, title: 'Project Hail Mary', img: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg' },
  { id: 17, title: 'Sapiens', img: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg' },
  { id: 18, title: 'The Alchemist', img: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg' },
  { id: 19, title: 'Fahrenheit 451', img: 'https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg' },
  { id: 20, title: 'The Midnight Library', img: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg' },
];

export const ROW_3 = [
  {
    id: 21,
    title: 'Grand Theft Auto V',
    img: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg',
  },
  {
    id: 22,
    title: 'The Witcher 3: Wild Hunt',
    img: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
  },
  {
    id: 23,
    title: 'Portal 2',
    img: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg',
  },
  {
    id: 24,
    title: 'Counter-Strike: Global Offensive',
    img: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg',
  },
  {
    id: 25,
    title: 'Tomb Raider',
    img: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eff6324653.jpg',
  },
  {
    id: 26,
    title: 'Red Dead Redemption 2',
    img: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
  },
  {
    id: 27,
    title: 'God of War',
    img: 'https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg',
  },
  {
    id: 28,
    title: 'Destiny 2',
    img: 'https://media.rawg.io/media/games/34b/34b1f1850a1c06fd971bc6ab3ac0ce0e.jpg',
  },
  {
    id: 29,
    title: 'Fallout 4',
    img: 'https://media.rawg.io/media/games/d82/d82990b9c67ba0d2d09d4e6fa88885a7.jpg',
  },
  {
    id: 30,
    title: 'Cyberpunk 2077',
    img: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
  },
];

// Used by useImagePreload — all 30 unique posters
export const ALL_POSTERS = [...ROW_1, ...ROW_2, ...ROW_3].map((p) => p.img);