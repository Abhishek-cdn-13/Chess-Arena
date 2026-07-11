import { getLegalMoves, getValidMoves, isKingInCheck, hasAnyValidMove, updateCastleRights, updateCastleRightsCaptured, castleRights, enPassantTarget, setEnPassantTarget } from "./move.js";
const board = document.querySelector(".container");
const boardState = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
];

const pieceImages = {
    p : "assets/Chess_pdt45.svg",
    r : "assets/Chess_rdt45.svg",
    n : "assets/Chess_ndt45.svg",
    b : "assets/Chess_bdt45.svg",
    q : "assets/Chess_qdt45.svg",
    k : "assets/Chess_kdt45.svg",
    P : "assets/Chess_plt45.svg",
    R : "assets/Chess_rlt45.svg",
    N : "assets/Chess_nlt45.svg",
    B : "assets/Chess_blt45.svg",
    Q : "assets/Chess_qlt45.svg",
    K : "assets/Chess_klt45.svg",
}


let selectedPiece = null;
let legalMoves = [];
let pieceMoved = false;

function renderBoard(){
    board.innerHTML = "";
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            const box = document.createElement("div");
            box.classList.add("box");
            box.dataset.row = i;
            box.dataset.col = j;
            box.classList.add("center");
            const piece = boardState[i][j];
            if(piece){
                const img = document.createElement("img");
                img.setAttribute("src", pieceImages[piece]);
                box.appendChild(img);
            } 
            if((i + j)%2 === 0){
                box.classList.add("white");
            }
            else{
                box.classList.add("black");
            }
            board.append(box);
            if(selectedPiece){
                if(i == selectedPiece.row && j == selectedPiece.col)
                    box.classList.add("selected");
            }
            const isLegal = legalMoves.some(move => 
                move.row === i && move.col === j
            );
            if(isLegal && !pieceMoved){
                box.classList.add("legal-move");
            }
        }
    }

}

renderBoard();

function isWhite(piece){
    return piece === piece.toUpperCase();
}

function isBlack(piece){
    return piece === piece.toLowerCase();
}

let currTurn = "white";

board.addEventListener("click", (e)=>{
    const square = e.target.closest(".box");
    if(!square) return ;
    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);
    console.log(`row = ${row}, col = ${col}`);
    handleBoardClick(row, col);
});

function handleBoardClick(row, col){
    if(selectedPiece){
        handleSecondClick(row, col);
    }
    else{
        handleFirstClick(row, col);
    }
}

function handleFirstClick(row, col){
    let piece = boardState[row][col];
    if(!piece) return ;
    if(currTurn == "white" && !isWhite(piece)) return;
    if(currTurn == "black" && !isBlack(piece)) return;
    selectedPiece = {row, col, piece};
    legalMoves = getValidMoves(boardState, piece, row, col);
    renderBoard();
}

function isLegalMove(row, col){
    return legalMoves.some(move =>
        move.row == row && move.col == col
    );
}

function handleSecondClick(row, col){
    if(isLegalMove(row, col)){
        movePiece(row, col);
        return;
    }
    const piece = boardState[row][col];
    if(piece && (currTurn == "white" && isWhite(piece)) || (currTurn == "black" && isBlack(piece))){
        selectedPiece = {
            row, col, piece
        }
        legalMoves = getValidMoves(boardState, piece, row, col);
        renderBoard();
    }
    selectedPiece = null;
    return ;
}


function movePiece(row, col){
    let nrow = selectedPiece.row;
    let ncol = selectedPiece.col;
    setEnPassantTarget(null);
    const capturedPiece = boardState[row][col];
    let piece = selectedPiece.piece;


    updateCastleRights(boardState[nrow][ncol], nrow, ncol);
    updateCastleRightsCaptured(capturedPiece, row, col);

    if((piece == "P" || piece == "p") && Math.abs(row - nrow) == 2){
        setEnPassantTarget({row : (row + nrow)/2, col});
    }
    const move = legalMoves.find(move =>
        move.row == row && move.col == col
    );

    if(move.type == "en-passant"){
        if(piece == "P"){
            boardState[row + 1][col] = "";
        }
        else if(piece == "p"){
            boardState[row - 1][col] = "";
        }
    }

    if(move.type == "castle-kingside" && isWhite(piece)){
        boardState[7][5] = boardState[7][7];
        boardState[7][7] = "";
    }
    else if(move.type == "castle-queenside" && isWhite(piece)){
        boardState[7][3] = boardState[7][0];
        boardState[7][0] = "";
    }
    else if(move.type == "castle-kingside" && isBlack(piece)){
        boardState[0][5] = boardState[0][7];
        boardState[0][7] = "";
    }
    else if(move.type == "castle-queenside" && isBlack(piece)){
        boardState[0][3] = boardState[0][0];
        boardState[0][0] = "";
    }

    boardState[row][col] = boardState[nrow][ncol];
    boardState[nrow][ncol] = '';
    selectedPiece = null;
    legalMoves = [];
    currTurn = currTurn === "white"?"black":"white";

    if(isKingInCheck(boardState, currTurn)){
        if(!hasAnyValidMove(boardState, currTurn)){
            alert("checkMate");
        }
        else{
            console.log("check");
        }
    }
    else{
        if(!hasAnyValidMove(boardState, currTurn)){
            alert("StaleMate");
        }
    }
    pieceMoved = true;
    renderBoard();
    pieceMoved = false;
}

