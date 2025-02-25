from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from game import TicTacToe
from player import SmartComputerPlayer, RandomComputerPlayer, HumanPlayer
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend-domain.vercel.app"],  # vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GameState(BaseModel):
    board: List[str]
    winner: str | None
    gameOver: bool


class MoveRequest(BaseModel):
    index: int


# Global game instance
game = None
x_player = None
o_player = None
game_mode = None
scores = {"X": 0, "O": 0, "Draws": 0}

type_mapping = {
    "pvp": (HumanPlayer, HumanPlayer),
    "easy": (HumanPlayer, RandomComputerPlayer),
    "hard": (HumanPlayer, SmartComputerPlayer)
}

@app.get("/")
async def read_root():
    return {"status": "ok"}


@app.post("/new_game")
async def new_game(mode: str):
    global game, x_player, o_player, game_mode, scores
    if mode not in type_mapping:
        raise HTTPException(status_code=400, detail="Invalid mode")

    if mode != game_mode:
        scores = {"X": 0, "O": 0, "Draws": 0}

    game = TicTacToe()
    x_class, o_class = type_mapping[mode]
    game_mode = mode
    x_player = x_class('X')
    o_player = o_class('O')
    return GameState(
        board=game.board,
        winner=None,
        gameOver=False
    )


@app.post("/make_move")
async def make_move(move_request: MoveRequest):
    global game, x_player, o_player, game_mode, scores

    if not game:
        raise HTTPException(status_code=400, detail="Game not initialized")

    # this function is created to check winner, and to avoid code repetition
    def check_winner(letter):
        if game.current_winner:
            scores[letter] += 1
            return GameState(board=game.board, winner=game.current_winner, gameOver=True)
        if not game.empty_squares():
            scores["Draws"] += 1
            return GameState(board=game.board, winner=None, gameOver=True)
        return None

    #pvp mode
    if game_mode == "pvp":
        # check who is current player
        x_moves = game.board.count('X')
        o_moves = game.board.count('O')
        current_letter = 'X' if x_moves <= o_moves else 'O'

        # make that move
        if not game.make_move(move_request.index, current_letter):
            raise HTTPException(status_code=400, detail="Invalid move")

        # check game status(win, draw or we continue playing)
        result = check_winner(current_letter)
        if result:
            return result

    #pvai mode
    else:
        # player turn
        if not game.make_move(move_request.index, 'X'):
            raise HTTPException(status_code=400, detail="Invalid move")

        result = check_winner('X')
        if result:
            return result

        # ai turn
        o_move = o_player.get_move(game)
        game.make_move(o_move, 'O')

        result = check_winner('O')
        if result:
            return result

    return GameState(board=game.board, winner=None, gameOver=False)


@app.get("/get_score")
async def get_score():
    return scores


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
