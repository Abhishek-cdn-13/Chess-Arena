import { getLegalMoves, getValidMoves, isKingInCheck, hasAnyValidMove, updateCastleRights,
    updateCastleRightsCaptured, castleRights, enPassantTarget, setEnPassantTarget,
    isInsufficientMaterial } from "./move.js";
const board = document.querySelector(".container");
const capturedBox_black = document.querySelector(".capturedBlack");
const capturedBox_white = document.querySelector(".capturedWhite");
const gameOver = document.querySelector(".game-over-box");
const gameOverCloseBtn = document.querySelector(".close");
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
let lastMove = null;
let checkMove = null;
let whiteCaptured = [];
let blackCaptured = [];
let moveHistory = [];
let checkMate = false;

gameOverCloseBtn.addEventListener("click", ()=>{
    gameOver.style.display = "none";
});

function renderBoard(){
    capturedBox_black.innerHTML = "";
    capturedBox_white.innerHTML = "";
    capturedBox_black.classList.add("capturedBox");
    capturedBox_white.classList.add("capturedBox");
    
    for(let i = 0; i < whiteCaptured.length; i++){
        const box = document.createElement("span");
        box.classList.add("capturePiece");
        capturedBox_black.append(box);
        const piece = whiteCaptured[i];
        const img = document.createElement("img");
        img.setAttribute("src", pieceImages[piece]);
        box.appendChild(img);
    }
    for(let i = 0; i < blackCaptured.length; i++){
        const box = document.createElement("span");
        box.classList.add("capturePiece");
        capturedBox_white.append(box);
        const piece = blackCaptured[i];
        const img = document.createElement("img");
        img.setAttribute("src", pieceImages[piece]);
        box.appendChild(img);
    }
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
            if(lastMove){
                if((lastMove.nrow == i && lastMove.ncol == j) || (lastMove.row == i && lastMove.col == j)){
                    box.classList.add("last-move");
                }
            }
            if(checkMove){
                if(checkMove.row == i && checkMove.col == j){
                    box.classList.add("check");
                }
            }
            if(checkMate){
                gameOver.style.display = "flex";
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

function getKingPosition(boardState, color){
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            let piece = boardState[row][col];
            if(isBlack(piece) && color == "white") continue;
            if(isWhite(piece) && color == "black") continue;
            if(piece == "k" || piece == "K"){
                return {row, col};
            }
        }
    }
}

function movePiece(row, col){
    let nrow = selectedPiece.row;
    let ncol = selectedPiece.col;
    setEnPassantTarget(null);
    const capturedPiece = boardState[row][col];
    if(isWhite(capturedPiece) && capturedPiece != ""){
        blackCaptured.push(capturedPiece);
        console.log(blackCaptured);
    }
    else if(isBlack(capturedPiece) && capturedPiece != ""){
        whiteCaptured.push(capturedPiece);
        console.log(whiteCaptured);
    }
    let piece = selectedPiece.piece;
    lastMove = {nrow, ncol, row, col};

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

    if(move.type == "promotion"){
        boardState[row][col] = isWhite(piece) ? "Q" : "q";  
    }

    moveHistory.push({
        piece,
        fromRow: nrow,
        fromCol: ncol,
        toRow: row,
        toCol: col,

        moveType: move.type,
        captured: capturedPiece,

        check: false,
        checkmate: false,
        promotion: move.type == "promotion",
        castle:
            move.type == "castle-kingside" ||
            move.type == "castle-queenside"
    });

    selectedPiece = null;
    legalMoves = [];
    currTurn = currTurn === "white"?"black":"white";

    if(isKingInCheck(boardState, currTurn)){
        if(!hasAnyValidMove(boardState, currTurn)){
            checkMate = true;
        }
        else{
            checkMove = getKingPosition(boardState, currTurn);
            console.log("check");
        }
    }
    else{
        checkMove = null;
        if(!hasAnyValidMove(boardState, currTurn)){
            alert("StaleMate");
        }
    }

    if(isInsufficientMaterial(boardState)){
        alert("Draw by insufficient material");
    }

    pieceMoved = true;
    renderBoard();
    pieceMoved = false;
}

