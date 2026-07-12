
export const castleRights = {
    whiteKing: true,
    blackKing: true,

    whiteQueenRook: true,
    whiteKingRook: true,

    blackQueenRook: true,
    blackKingRook: true
}
export let enPassantTarget = null;

export function setEnPassantTarget(target){
    enPassantTarget = target;
}


function isWhite(piece){
    return piece === piece.toUpperCase();
}

function isBlack(piece){
    return piece === piece.toLowerCase();
}


export function getLegalMoves(boardState, piece, row, col){
    if(piece == "P" || piece == "p"){
        return getPawnMoves(boardState, piece,row,col);
    }
    else if(piece == "R" || piece == "r"){
        return getRukhMoves(boardState, piece, row, col);
    }
    else if(piece == "B" || piece == "b"){
        return getBishopMoves(boardState, piece, row, col);
    }
    else if(piece == "N" || piece == "n"){
        return getKnightMoves(boardState, piece, row, col);
    }
    else if(piece == "Q" || piece == "q"){
        return getQueenMoves(boardState, piece, row, col);
    }
    else if(piece == "K" || piece == "k"){
        return getKingMoves(boardState, piece, row, col);
    }
    return [];
}

export function getPawnMoves(boardState, piece, row, col) {

    const moves = [];

    const direction = isWhite(piece) ? -1 : 1;
    const startRow = isWhite(piece) ? 6 : 1;
    const promotionRow = isWhite(piece) ? 0 : 7;

    let newRow = row + direction;
    let dir = [-1, 1];
    for(let i = 0; i < 2; i++){
        let newCol = col + dir[i];
        if(newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8){
            if(isEnemy(piece, boardState[newRow][newCol])){
                if(newRow == promotionRow){
                    moves.push({row : newRow, col : newCol, type : "promotion"});
                }
                else{
                    moves.push({row : newRow, col : newCol, type : "normal"});
                }
            }
            else if(enPassantTarget && enPassantTarget.row == newRow && enPassantTarget.col == newCol){
                moves.push({row : newRow, col : newCol, type : "en-passant"});
            }
        }
    }

    if (boardState[newRow][col] === "") {
        if(newRow == promotionRow){
            moves.push({row : newRow, col, type : "promotion"});
        }
        else{
            moves.push({row : newRow, col, type : "normal"});
        }
        if (row === startRow) {

            let doubleRow = row + 2 * direction;

            if (boardState[doubleRow][col] === "") {
                moves.push({ row: doubleRow, col, type : "normal"});
            }
        }
    }

    return moves;
}

function isEnemy(piece, target){
    if(piece == '' || target == '')
            return false;
    return (isWhite(piece) && isBlack(target) || isWhite(target) && isBlack(piece));
}

export function getRukhMoves(boardState, piece, row, col){
    let direction = [
        [-1,0],
        [1,0],
        [0,-1],
        [0,1]
    ]
    let moves = [];

    for(let it of direction){
        let nrow = row + it[0];
        let ncol = col +  it[1];
        while(nrow >= 0 && nrow < 8 && ncol >= 0 && ncol < 8){
            let target = boardState[nrow][ncol];
            if(target == ''){
                moves.push({row : nrow, col : ncol, type : "normal"});
            }
            else if(isEnemy(piece, target)){
                moves.push({row : nrow, col : ncol, type : "normal"});
                break;
            }
            else{
                break;
            }
            nrow += it[0];
            ncol += it[1];
        }
    }
    return moves;
}


export function getBishopMoves(boardState, piece, row, col){
    let moves = [];
    let direction = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ]

    for(let it of direction){
        let nRow = row + it[0];
        let nCol = col + it[1];
        while(nRow >= 0 && nRow < 8 && nCol >= 0 && nCol < 8){
            if(boardState[nRow][nCol] == ''){
                moves.push({row : nRow, col : nCol, type : "normal"});
            }
            else if(isEnemy(piece, boardState[nRow][nCol])){
                moves.push({row : nRow, col : nCol, type : "normal"});
                break;
            }
            else{
                break;
            }
            nRow += it[0];
            nCol += it[1];
        }
    }
    return moves;
}

export function getKnightMoves(boardState, piece, row, col){
    let moves = [];
    let dx = [-1, -2, -2, -1, 1, 2, 2, 1];
    let dy = [-2, -1, 1, 2, 2, 1, -1, -2];
    for(let i = 0; i < 8; i++){
        let newRow = row + dx[i];
        let newCol = col + dy[i];
        if(newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7){
            if(boardState[newRow][newCol] == ''){
                moves.push({row : newRow, col : newCol, type : "normal"});
            }
            else if(isEnemy(piece, boardState[newRow][newCol])){
                moves.push({row : newRow, col : newCol, type : "normal"});
            }
        }
    }
    return moves;
}

export function getQueenMoves(boardState, piece, row, col){
    let moves =  [];
    moves = getBishopMoves(boardState, piece, row, col).concat(getRukhMoves(boardState, piece, row, col));
    return moves;
}

export function getKingMoves(boardState, piece, row, col){
    let moves = [];
    let dx = [-1, -1, -1, 0, 1, 1, 1, 0];
    let dy = [-1, 0, 1, 1, 1, 0, -1, -1];


    for(let i = 0; i < 8; i++){
        let newRow = row + dx[i];
        let newCol = col + dy[i];
        if(newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7){
            if(boardState[newRow][newCol] == ''){
                moves.push({row : newRow, col : newCol, type : "normal"});
            }
            else if(isEnemy(piece, boardState[newRow][newCol])){
                moves.push({row : newRow, col : newCol, type : "normal"});
            }
        }
    }

    if(piece == "K" && castleRights.whiteKing && castleRights.whiteKingRook){
        if(boardState[7][5] == "" && boardState[7][6] == "" && isKingSafeOnSquare(boardState, piece,7, 4, 7, 5) && isKingSafeOnSquare(boardState, piece, 7, 4, 7, 6)){
            if(!isKingInCheck(boardState, "white")){
                moves.push({row : 7, col : 6, type : "castle-kingside"});
            }
        }
    }
    if(piece == "K" && castleRights.whiteKing && castleRights.whiteQueenRook){
        if(boardState[7][1] == "" && boardState[7][2] == "" && boardState[7][3] == ""){
            if(!isKingInCheck(boardState, "white") && isKingSafeOnSquare(boardState, piece, 7, 4, 7, 2) && isKingSafeOnSquare(boardState, piece, 7, 4, 7, 3)){
                moves.push({row : 7, col : 2, type : "castle-queenside"});
            }
        }
    }
    if(piece == "k" && castleRights.blackKing && castleRights.blackKingRook){
        if(boardState[0][5] == "" && boardState[0][6] == ""){
            if(!isKingInCheck(boardState, "black") && isKingSafeOnSquare(boardState, piece, 0, 4, 0, 5) && isKingSafeOnSquare(boardState, piece, 0, 4, 0, 6)){
                moves.push({row : 0, col : 6, type : "castle-kingside"});
            }
        }
    }
    if(piece == "k" && castleRights.blackKing && castleRights.blackQueenRook){
        if(boardState[0][1] == "" && boardState[0][2] == "" && boardState[0][3] == ""){
            if(!isKingInCheck(boardState, "black") && isKingSafeOnSquare(boardState, piece, 0, 4, 0, 2) && isKingSafeOnSquare(boardState, piece, 0, 4, 0, 3)){
                moves.push({row : 0, col : 2, type : "castle-queenside"});
            }
        }
    }

    return moves;
}


export function isKingInCheck(boardState, color){
    let kingRow;
    let kingCol;

    // find the king
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            let piece = boardState[row][col];
            if(color == "white" && isWhite(piece) && piece == "K"){
                kingRow = row;
                kingCol = col;
            }
            if(color == "black" && isBlack(piece) && piece == "k"){
                kingRow = row;
                kingCol = col;
            }
        }
    }
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            let piece = boardState[row][col];
            if(piece == '') continue;
            if(color == "white" && isWhite(piece)) continue;
            if(color == "black" && isBlack(piece)) continue;

            if(piece == "P"){
                let dx = [-1, -1];
                let dy = [-1, 1];
                for(let i = 0; i < 2; i++){
                    let nr = row + dx[i];
                    let nc = col + dy[i];
                    if(nr >= 0 && nr < 8 && nc >= 0 && nc < 8){
                        if(nr == kingRow && nc == kingCol){
                            return true;
                        }
                    }
                }
                continue;
            }
            if(piece == "p"){
                let dx = [1, 1];
                let dy = [-1, 1];
                for(let i = 0; i < 2; i++){
                    let nr = row + dx[i];
                    let nc = col + dy[i];
                    if(nr >= 0 && nr < 8 && nc >= 0 && nc < 8){
                        if(nr == kingRow && nc == kingCol){
                            return true;
                        }
                    }
                }
                continue;
            }

            if(piece == "k" || piece == "K"){
                const dx = [-1,-1,-1,0,1,1,1,0];
                const dy = [-1,0,1,1,1,0,-1,-1];
                for(let i = 0; i < 8; i++){
                    let nr = row + dx[i];
                    let nc = col + dy[i];
                    if(nr == kingRow && nc == kingCol){
                        return true;
                    }
                }
                continue;
            }

            const moves = getLegalMoves(boardState, piece, row, col);
            if(moves.some(move =>
                move.row == kingRow && move.col == kingCol
            )){
                return true;
            }
        }
    }
    return false;
}

function cloneBoard(boardState){
    return boardState.map(row => [...row]);
}


export function getValidMoves(boardState, piece, row, col){
    let testingBoard = cloneBoard(boardState);
    let moves = [];
    let pseudoMoves = getLegalMoves(boardState, piece, row, col);
    for(let it of pseudoMoves){
        const capturedPiece = testingBoard[it.row][it.col];
        let enPassantCapturedPiece = null;
        
        if(it.type == "en-passant"){

            if(piece == "P"){
                enPassantCapturedPiece = testingBoard[it.row + 1][it.col];
                testingBoard[it.row + 1][it.col] = "";
            }
            else{
                enPassantCapturedPiece = testingBoard[it.row - 1][it.col];
                testingBoard[it.row - 1][it.col] = "";
            }

        }
        testingBoard[it.row][it.col] = piece;
        testingBoard[row][col] = '';


        let color = isWhite(piece)?"white":"black";
        if(!isKingInCheck(testingBoard, color)){
            moves.push({...it});
        }

        if(it.type == "en-passant"){

            if(piece == "P"){
                testingBoard[it.row + 1][it.col] = enPassantCapturedPiece;
            }
            else{
                testingBoard[it.row - 1][it.col] = enPassantCapturedPiece;
            }

        }

        testingBoard[it.row][it.col] = capturedPiece;
        testingBoard[row][col] = piece;
    }
    return moves;
}


export function hasAnyValidMove(boardState, color){
    let moves = [];
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            let piece = boardState[row][col];
            if(color == "black" && isBlack(piece)){
                moves = getValidMoves(boardState, piece, row, col);
                if(moves.length > 0){
                    return true;
                }
            }
            if(color == "white" && isWhite(piece)){
                moves = getValidMoves(boardState, piece, row, col);
                if(moves.length > 0){
                    return true;
                }
            }
        }
    }
    return false;
}

export function updateCastleRights(piece, row, col){
    console.log({piece, row, col});
    if(piece == "R" && row == 7 && col == 0){
        castleRights.whiteQueenRook = false;
        console.log(castleRights.whiteQueenRook);
    }
    if(piece == "R" && row == 7 && col == 7){
        castleRights.whiteKingRook = false;
        console.log(castleRights.whiteKingRook);
    }
    
    if(piece == "r" && row == 0 && col == 0){
        castleRights.blackQueenRook = false;
        console.log(castleRights.blackQueenRook);
    }
    if(piece == "r" && row == 0 && col == 7){
        castleRights.blackKingRook = false;
        console.log(castleRights.blackKingRook);
    }
    if(piece == "k"){
        castleRights.blackKing = false;
        console.log(castleRights.blackKing);
    }
    if(piece == "K"){
        castleRights.whiteKing = false;
        console.log(castleRights.whiteKing);
    }
}

function isKingSafeOnSquare(boardState, piece, fromRow, fromCol, toRow, toCol){
    const testingBoard = cloneBoard(boardState);
    testingBoard[toRow][toCol] = piece;
    testingBoard[fromRow][fromCol] = "";
    const color = isWhite(piece)?"white":"black";
    return !isKingInCheck(testingBoard, color);
}

export function updateCastleRightsCaptured(capturePiece, row, col){
    if((capturePiece == "R") && row == 7 && col == 0){
        castleRights.whiteQueenRook = false;
        console.log(castleRights.whiteQueenRook);
    }
    else if((capturePiece == "R") && row == 7 && col == 7){
        castleRights.whiteKingRook = false;
        console.log(castleRights.whiteKingRook);
    }
    else if((capturePiece == "r") && row == 0 && col == 0){
        castleRights.blackQueenRook = false;
        console.log(castleRights.blackQueenRook);
    }
    else if((capturePiece == "r") && row == 0 && col == 7){
        castleRights.blackKingRook = false;
        console.log(castleRights.blackKingRook);
    }
}


export function isInsufficientMaterial(boardState){
    let whitePieces = [];
    let blackPieces = [];
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            let piece = boardState[row][col];
            if(piece == "") continue;
            if(isWhite(piece)){
                whitePieces.push(piece);
            }
            else{
                blackPieces.push(piece);
            }
        }
    }
    if(whitePieces.length == 1 && blackPieces.length == 1){
        return true;
    }
    else if(whitePieces.length == 2 && blackPieces.length == 1 && whitePieces.includes("B")){
        return true;
    }
    else if(whitePieces.length == 1 && blackPieces.length == 2 && blackPieces.includes("b")){
        return true;
    }
    else if(whitePieces.length == 2 && blackPieces.length == 1 && whitePieces.includes("N")){
        return true;
    }
    else if(whitePieces.length == 1 && blackPieces.length == 2 && blackPieces.includes("n")){
        return true;
    }
    return false;
}



