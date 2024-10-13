import { Room, Client, Delayed, Protocol, ServerError } from 'colyseus';
import { GameState, Player } from './schema/GameState';
import gameConfig from '../game.config';
import log from 'npmlog';
import {generateRoomId,} from './utility';

export class GameRoom extends Room<GameState> {
  /** Current timeout skip reference */
  public inactivityTimeoutRef?: Delayed;
  public delayedRoundStartRef?: Delayed;
  public delayedRoomDeleteRef?: Delayed;


  public autoDispose = false;
  private LOBBY_CHANNEL = 'GameRoom';

  private log(msg: string, client?: Client | string) {
    if (process.env.ROOM_LOG_DISABLE == 'true') return;

    log.info(
      `Room ${this.roomId} ${client ? 'Client ' + ((<any>client).sessionId || client) : ''
      }`,
      msg
    );
  }

  private async registerRoomId(): Promise<string> {
    const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
    let id;

    do id = generateRoomId();
    while (currentIds.includes(id));

    await this.presence.sadd(this.LOBBY_CHANNEL, id);
    return id;
  }


  async onCreate() {
    this.roomId = await this.registerRoomId();
    this.setPrivate();
    this.setState(new GameState({}));
    this.clock.start();

    this.log('Created');

    //Send ping messages to all clients
    this.clock.setInterval(() => {
      this.broadcast('ping');
    }, gameConfig.pingInterval);

    // Client message listeners:

    this.onMessage("updatePosition", (client, data) => {
      console.log("update received -> ");
      console.debug(JSON.stringify(data));
      const player = this.state.players.get(client.sessionId);
      player.x = data["x"];
      player.y = data['y'];
      player.z = data["z"];
      console.log("got position")

      this.broadcast("playerMoved", {
        sessionId: client.sessionId,
        position: { x: player.x, y: player.y, z: player.z },
      });
    });

    this.onMessage("SendDrawpoints", (client, data) => {
      console.debug(JSON.stringify(data));
      const player = this.state.players.get(client.sessionId);


      this.broadcast("Rdrawpoints", {
        sessionId: client.sessionId,
        points: data,
      });
    });


  }

  onAuth(client: Client) {
    if (this.state.players.size == gameConfig.maxClients)
      throw new ServerError(gameConfig.roomFullCode, 'room is full');

    if (
      this.state.players.size + Object.keys(this.reconnections).length ==
      gameConfig.maxClients
    ) {
      Object.values(this.reconnections)[0].reject();
    }

    return true;
  }

  onJoin(client: Client) {
    this.log(`Join`, client);

    this.state.players.set(
      client.sessionId,
      new Player({
        sessionId: client.sessionId,
        displayName: 'user',
        admin: this.state.players.size == 0,
      })
    );

  }

  async onLeave(client: Client, consented: boolean) {
    this.log(`Leave`, client);

    const player = this.state.players.get(client.sessionId);


    try {
      this.log(`Allow reconnection`, client);

      await this.allowReconnection(client);

      this.log(`Reconnect`, client);


      if (!this.state.players.has(client.sessionId)) {
        this.state.players.set(client.sessionId, player.clone());
      }
    } catch (error) { }
  }

  onDispose() {
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
    this.log(`Disposing`);
  }










}
