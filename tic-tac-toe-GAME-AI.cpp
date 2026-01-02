#include <iostream>
#include <array>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <algorithm>
#include <limits>
#include <cstdint>
// Elite Minimax Implementation for Unbeatable Tic-Tac-Toe AI
// Time Complexity: O(b^d) where b=9 (branching factor), d=9 (max depth)
// Alpha-Beta pruning reduces this significantly in practice
using namespace std;

enum GameMode {
    PVP,        // Player vs Player
    PVAI_EASY,  // Player vs AI (random moves)
    PVAI_HARD,  // Player vs AI (minimax with alpha-beta pruning)
    AIVAI       // AI vs AI demonstration
};

struct Stats {
    int winsX = 0;
    int winsO = 0;
    int draws = 0;
    int totalGames = 0;
};

class TicTacToe {
private:
    array<char, 9> board;  // Using std::array for fixed-size board (modern C++ practice)
    char currentPlayer;
    GameMode mode;

public:
    TicTacToe(GameMode m = PVAI_EASY) : board{' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '}, currentPlayer('X'), mode(m) {
        srand(static_cast<unsigned int>(time(nullptr)));
    }

    void displayBoard() {
        cout << "\n";
        for (int i = 0; i < 9; i++) {
            cout << " " << board[i] << " ";
            if ((i + 1) % 3 != 0) cout << "|";
            else if (i != 8) cout << "\n---+---+---\n";
        }
        cout << "\n\n";
    }

    bool isValidMove(int move) {
        return move >= 1 && move <= 9 && board[move - 1] == ' ';
    }

    void makeMove(int move) {
        board[move - 1] = currentPlayer;
    }

    char checkWinner() {
        // Check rows, columns, diagonals
        int winConditions[8][3] = {
            {0,1,2}, {3,4,5}, {6,7,8}, // rows
            {0,3,6}, {1,4,7}, {2,5,8}, // columns
            {0,4,8}, {2,4,6} // diagonals
        };

        for (auto& condition : winConditions) {
            if (board[condition[0]] != ' ' &&
                board[condition[0]] == board[condition[1]] &&
                board[condition[0]] == board[condition[2]]) {
                return board[condition[0]];
            }
        }

        if (find(board.begin(), board.end(), ' ') == board.end()) {
            return 'D'; // Draw AL3XIR 
        }

        return ' '; // No winner yet (JM3O 7WAYJKOUM TA3ADOUL)
    }

    // Elite Minimax Algorithm with Alpha-Beta Pruning
    // Time Complexity: O(b^d) worst case, but alpha-beta pruning reduces this significantly
    // In practice, explores only ~4,000 nodes instead of 9! = 362,880 for Tic-Tac-Toe
    int minimax(bool isMaximizing, int alpha = numeric_limits<int>::min(), int beta = numeric_limits<int>::max()) {
        char winner = checkWinner();

        // Terminal states: game over
        if (winner == 'O') return 10;        // AI (O) wins - maximum score
        if (winner == 'X') return -10;       // Human (X) wins - minimum score
        if (winner == 'D') return 0;         // Draw - neutral score

        if (isMaximizing) {
            // AI's turn (O) - maximize score
            int maxEval = numeric_limits<int>::min();
            for (int i = 0; i < 9; ++i) {
                if (board[i] == ' ') {
                    board[i] = 'O';
                    int eval = minimax(false, alpha, beta);
                    board[i] = ' ';
                    maxEval = max(maxEval, eval);
                    alpha = max(alpha, eval);

                    // Alpha-beta pruning: if current max >= beta, opponent won't choose this path
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            // Human's turn (X) - minimize score
            int minEval = numeric_limits<int>::max();
            for (int i = 0; i < 9; ++i) {
                if (board[i] == ' ') {
                    board[i] = 'X';
                    int eval = minimax(true, alpha, beta);
                    board[i] = ' ';
                    minEval = min(minEval, eval);
                    beta = min(beta, eval);

                    // Alpha-beta pruning: if current min <= alpha, AI won't choose this path
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    }

    void aiMoveHard() {
        int bestScore = numeric_limits<int>::min();
        int bestMove = -1;
        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') {
                board[i] = 'O';
                int score = minimax(false);
                board[i] = ' ';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i + 1;
                }
            }
        }
        if (bestMove != -1) {
            makeMove(bestMove);
        }
    }

    void aiMove() {
        vector<int> emptyCells;
        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') emptyCells.push_back(i + 1);
        }
        if (!emptyCells.empty()) {
            int randomIndex = rand() % emptyCells.size();
            makeMove(emptyCells[randomIndex]);
        }
    }

    void switchPlayer() {
        currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';
    }

    char getWinner() {
        return checkWinner();
    }

    void play() {
        cout << "Welcome to Tic-Tac-Toe!\n";
        if (mode == PVP) {
            cout << "Player vs Player mode.\n";
        } else if (mode == PVAI_EASY) {
            cout << "You are X, AI is O (easy level).\n";
        } else if (mode == PVAI_HARD) {
            cout << "You are X, AI is O (hard level).\n";
        } else if (mode == AIVAI) {
            cout << "AI vs AI mode.\n";
        }
        if (mode != AIVAI) {
            cout << "Enter numbers 1-9 to make your move.\n";
        }

        while (true) {
            displayBoard();

            char winner = checkWinner();
            if (winner != ' ') {
                if (winner == 'D') {
                    cout << "It's a draw!\n";
                } else {
                    cout << winner << " wins!\n";
                }
                break;
            }

            bool isHumanTurn = false;
            if (mode == PVP) {
                isHumanTurn = true;
            } else if (mode == PVAI_EASY || mode == PVAI_HARD) {
                isHumanTurn = (currentPlayer == 'X');
            } else if (mode == AIVAI) {
                isHumanTurn = false;
            }

            if (isHumanTurn) {
                int move;
                cout << "Player " << currentPlayer << ", enter your move (1-9): ";
                cin >> move;
                if (!isValidMove(move)) {
                    cout << "Invalid move. Try again.\n";
                    continue;
                }
                makeMove(move);
            } else {
                cout << "AI is thinking...\n";
                if (mode == PVAI_HARD && currentPlayer == 'O') {
                    aiMoveHard();
                } else {
                    aiMove();
                }
            }

            switchPlayer();
        }

        displayBoard();
    }
};
// main function to run the game . peace brother 60 hrs aaahh situation hhhh(using all books ,tuturials ,videos i got this finally 😂👌(●'◡'●)).
int main() {
    Stats stats;
    bool playAgain = true;

    while (playAgain) {
        cout << "Select game mode:\n";
        cout << "1. Player vs Player\n";
        cout << "2. Player vs AI (Easy)\n";
        cout << "3. Player vs AI (Hard)\n";
        cout << "4. AI vs AI\n";
        cout << "Enter choice (1-4): ";
        int choice;
        cin >> choice;

        GameMode mode;
        switch (choice) {
            case 1: mode = PVP; break;
            case 2: mode = PVAI_EASY; break;
            case 3: mode = PVAI_HARD; break;
            case 4: mode = AIVAI; break;
            default: mode = PVAI_EASY; break;
        }

        TicTacToe game(mode);
        game.play();

        char winner = game.getWinner();
        if (winner == 'X') stats.winsX++;
        else if (winner == 'O') stats.winsO++;
        else if (winner == 'D') stats.draws++;
        stats.totalGames++;

        cout << "\nGame Statistics:\n";
        cout << "X Wins: " << stats.winsX << "\n";
        cout << "O Wins: " << stats.winsO << "\n";
        cout << "Draws: " << stats.draws << "\n";
        cout << "Total Games: " << stats.totalGames << "\n";

        cout << "\nPlay again? (y/n): ";
        char replay;
        cin >> replay;
        playAgain = (replay == 'y' || replay == 'Y');
    }

    return 0;
}

