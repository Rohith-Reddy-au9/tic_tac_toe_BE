var socket = io();
var symbol;

$(function () {
  $(".board button").attr("disabled", true);
  $(".board> button").on("click", makeMove);
  socket.on("move.made", function (data) {
    $("#" + data.position).text(data.symbol);
    myTurn = data.symbol !== symbol;

    // if game is ongoing 
    if (!isGameOver()) {
      if (gameTied()) {
        $("#messages").text("Game Drawn!");
        $(".board button").attr("disabled", true);
      } else {
        renderTurnMessage();
      }
      
    } 
    //  if game is over
    else {

      // messeages for looser and winner 
      if (myTurn) {
        $("#messages").text("You lost 😩  wana try! refresh it start the game.");
      } else {
        $("#messages").text("Game over. congratulations !! 🤗 You won! wanna play again!  ");
      }
      $(".board button").attr("disabled", true);
    }
  });

  // initial stae of the game
  socket.on("game.begin", function (data) {
    // The server will asign X or O to the player
    symbol = data.symbol;
    myTurn = symbol === "X";
    renderTurnMessage();
  });

  // if opponent leave the game you can play the game 
  socket.on("opponent.left", function () {
    $("#messages").text("Your opponent left the game 😑.");
    $(".board button").attr("disabled", true);
  });
});

function getBoardState() {
  var obj = {};
  $(".board button").each(function () {
    obj[$(this).attr("id")] = $(this).text() || "";
  });
  return obj;
}

function gameTied() {
  var state = getBoardState();

  if (
    state.a0 !== "" &&
    state.a1 !== "" &&
    state.a2 !== "" &&
    state.b0 !== "" &&
    state.b1 !== "" &&
    state.b2 !== "" &&
    state.b3 !== "" &&
    state.c0 !== "" &&
    state.c1 !== "" &&
    state.c2 !== ""
  ) {
    return true;
  }
}

function isGameOver() {
  var state = getBoardState(),
    matches = ["XXX", "OOO"],
    rows = [
      state.a0 + state.a1 + state.a2,
      state.b0 + state.b1 + state.b2,
      state.c0 + state.c1 + state.c2,
      state.a0 + state.b1 + state.c2,
      state.a2 + state.b1 + state.c0,
      state.a0 + state.b0 + state.c0,
      state.a1 + state.b1 + state.c1,
      state.a2 + state.b2 + state.c2,
    ];

  // to either 'XXX' or 'OOO'
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      return true;
    }
  }
}

function renderTurnMessage() {
  // opponents turn || ypur turn
  if (!myTurn) {
    $("#messages").text("Your opponent's turn 👉👉👉");
    $(".board button").attr("disabled", true);
  } else {
    $("#messages").text("Your turn 👈👈👈");
    $(".board button").removeAttr("disabled");
  }
}

function makeMove(e) {
  e.preventDefault();
  if (!myTurn) {
    return;
  }
  // it checks the space
  if ($(this).text().length) {
    return;
  }

  // server connection
  socket.emit("make.move", {
    symbol: symbol,
    position: $(this).attr("id"),
  });
}
