import { Chess, SQUARES } from 'chess.js'
// documnetation: https://github.com/jhlywa/chess.js?tab=readme-ov-file
// documentation: https://jhlywa.github.io/chess.js/
// execute with: node main.ts

const SEPARATOR = "---------------";

function boardAdvanced(n: number): Chess        //n must be an integer
{
  const returnBoard = new Chess();
  for(let i = 0; i < n; i++) {
    const moves = returnBoard.moves();
    const move = moves[Math.floor(Math.random() * moves.length)];
    returnBoard.move(move);
  }
  return returnBoard;
}

function similarity(chess01: Chess, chess02: Chess): number {
    let return_value: number = 0.0;

    for(let i = 0; i < 64; i++) {
      const current_square = SQUARES[i];
      const piece01 = chess01.get(current_square);
      const piece02 = chess02.get(current_square);
      if(piece01 === undefined && piece02 === undefined){
        return_value += 1.0;
      } else if(piece01 === undefined && piece02 !== undefined){
        //do nothing
      } else if(piece01 !== undefined && piece02 === undefined){
        //do nothing
      } else {
        //here they are both defined
        const same_color = piece01["color"] === piece02["color"];
        const same_type = piece01["type"] === piece02["type"];
        if(same_color && same_type){
          return_value += 1.0;
        } else if(same_color && !same_type){
          return_value += 0.35;
        } else{
          return_value += 0.0;
        }
      }
    }

    return return_value;
}

const chess01 = new Chess();

for(let i = 0; i < 30; i++){
  const chess02 = boardAdvanced(i);
  const simScore = similarity(chess01, chess02);
  console.log("Advancement:", i);
  console.log("Similarity score:", simScore);
  console.log("Similarity percentage:", (simScore/64.0) * 100.0 );
  //console.log("Legal moves:", chess02.moves());
}

