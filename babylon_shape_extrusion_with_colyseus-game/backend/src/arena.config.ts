import Arena from '@colyseus/arena';
import { GameRoom } from './rooms/GameRoom';

export default Arena({
  options: {
    greet: false,
  },

  getId: () => 'SHIVA-GAME',

  initializeGameServer: (gameServer) => {
    gameServer.define('gameRoom', GameRoom);
  },
});
