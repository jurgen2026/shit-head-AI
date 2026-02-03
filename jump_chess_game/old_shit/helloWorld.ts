import { Chess } from 'chess.js'
// documentation: https://jhlywa.github.io/chess.js/
// node main.ts

const chess = new Chess()

while (!chess.isGameOver()) {
  const moves = chess.moves()
  const move = moves[Math.floor(Math.random() * moves.length)]
  chess.move(move)
}
console.log(chess.pgn())