const readlineSync = require('readline-sync');

class Player {
  constructor(name) {
    this.name = name;
    this.frames = Array(10).fill(null).map(() => ({ rolls: [], score: 0 }));
    this.totalScore = 0;
  }
}

class BowlingGame {
  constructor() {
    this.players = [];
  }

  startGame() {
    console.log('Démarrez une nouvelle partie de bowling.');
    const numPlayers = readlineSync.questionInt('Entrez le nombre de joueurs (1-6): ', {
      limit: [1, 2, 3, 4, 5, 6]
    });

    for (let i = 0; i < numPlayers; i++) {
      const name = readlineSync.question(`Entrez le nom du joueur ${i + 1}: `);
      this.players.push(new Player(name));
    }

    this.playGame();
    this.calculateFinalScores();
    this.displayFinalScores();
  }

  playGame() {
    for (let frame = 0; frame < 10; frame++) {
      console.log(`Frame ${frame + 1}`);
      for (let player of this.players) {
        this.playFrame(player, frame);
      }
    }
  }

  playFrame(player, frameIndex) {
    for (let roll = 0; roll < (frameIndex === 9 ? 3 : 2); roll++) {
      const pins = readlineSync.questionInt(`${player.name}, combien de quilles avez-vous renversé pour lancer ${roll + 1}? `, {
        limit: input => input >= 0 && input <= 10
      });

      player.frames[frameIndex].rolls.push(pins);

      if (frameIndex < 9 && roll === 0 && pins === 10) {
        console.log(`${player.name} a fait un Strike!`);
        break;
      }

      if (frameIndex < 9 && roll === 1 && (player.frames[frameIndex].rolls[0] + pins) === 10) {
        console.log(`${player.name} a fait un Spare!`);
      }

      if (frameIndex === 9 && (player.frames[frameIndex].rolls[0] === 10 || (player.frames[frameIndex].rolls[0] + player.frames[frameIndex].rolls[1]) === 10)) {
        continue;
      }

      if (frameIndex === 9 && roll === 1 && player.frames[frameIndex].rolls[0] !== 10 && (player.frames[frameIndex].rolls[0] + player.frames[frameIndex].rolls[1]) !== 10) {
        break;
      }
    }
  }

  calculateFinalScores() {
    for (let player of this.players) {
      for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
        const frame = player.frames[frameIndex];
        frame.score = frame.rolls.reduce((acc, pins) => acc + pins, 0);

        if (frameIndex < 9) {
          if (frame.rolls[0] === 10) {  // Strike
            frame.score += this.getStrikeBonus(player, frameIndex);
          } else if (frame.rolls[0] + frame.rolls[1] === 10) {  // Spare
            frame.score += this.getSpareBonus(player, frameIndex);
          }
        }

        player.totalScore += frame.score;
      }
    }
  }

  getStrikeBonus(player, frameIndex) {
    const nextFrame = player.frames[frameIndex + 1];
    if (nextFrame.rolls.length > 1) {
      return nextFrame.rolls[0] + nextFrame.rolls[1];
    } else if (frameIndex + 2 < 10) {
      return nextFrame.rolls[0] + player.frames[frameIndex + 2].rolls[0];
    }
    return nextFrame.rolls[0] || 0;
  }

  getSpareBonus(player, frameIndex) {
    const nextFrame = player.frames[frameIndex + 1];
    return nextFrame.rolls[0] || 0;
  }

  displayFinalScores() {
    console.log('Score final:');
    this.players.forEach(player => {
      console.log(`${player.name}: ${player.totalScore}`);
    });

    const maxScore = Math.max(...this.players.map(player => player.totalScore));
    const winners = this.players.filter(player => player.totalScore === maxScore).map(player => player.name);

    if (winners.length === 1) {
      console.log(`${winners[0]} est le/la gagnant(e) !`);
    } else {
      console.log(`Les gagnants sont: ${winners.join(', ')}`);
    }
  }
}

const game = new BowlingGame();
game.startGame();