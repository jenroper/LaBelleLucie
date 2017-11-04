var tableaus;
var foundations;
var dealsRemaining = 4;

function Card(value, suit) {
  this.suit = suit;
  this.value = value;
}

function Foundation() {
  this.suit= "None";
  this.cards = [];
}

function buildDeck() {
  var deck = new Array();
  var suits = ["Hearts", "Clubs", "Diamonds", "Spades"];
  for (var suit in suits) {
    for (var i = 1; i <= 13; i++) {
      var card = new Card(i, suits[suit]);
      deck.push(card);
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  var oldDeck = deck;
  var newDeck = new Array();
  while (oldDeck.length > 1) {
    var i = Math.floor(Math.random() * oldDeck.length);
    newDeck.push(oldDeck[i]);
    oldDeck.splice(i, 1);
  }
  newDeck.push(oldDeck[0]);

  return newDeck;
}

function deal(deck) {
  // wipe existing board.
  tableausDOM = document.getElementById("tableaus");
  tableausDOM.innerHTML = "";
  var numTab = 0
  tableaus = [];

  //deal
  while (deck.length > 0) {
    // add new tab to docment
    var tab = document.createElement("div");
    tab.setAttribute("id", "tab-" + numTab);
    tab.setAttribute("class", "tab");
    tableausDOM.appendChild(tab);

    // add cards to tab
    if (deck.length >= 3) {
      tableaus.push(buildTab(tab, deck.pop(), deck.pop(), deck.pop()));
    } else if (deck.length == 2) {
      tableaus.push(buildTab(tab, deck.pop(), deck.pop(), null));
    } else if (deck.length == 1) {
      tableaus.push(buildTab(tab, deck.pop(), null, null));
    }

    numTab++;
  }

  setActiveCards();
  updateRemainingDeals();
}

function buildTab(tab, card0, card1, card2) {
  // wipe existing tab
  tab.innerHTML = "";

  // newTableau is an array that will hold 1-3 cards
  var newTableau = []

  var card0Image = buildCardImage(card0, "card0");
  newTableau.push(card0);
  card0Image.setAttribute("style", calculateFirstCardPosition(tab));
  card0Image.onmouseover = function(event) {
    showCardLabel(card0);
  };
  tab.appendChild(card0Image);
  if (card1 != null) {
    newTableau.push(card1);
    var card1Image = buildCardImage(card1, "card1");
    card1Image.setAttribute("style", calculateTabPosition(card0Image, 34, 2));
    card1Image.onmouseover = function(event) {
      showCardLabel(card1);
    };
    tab.appendChild(card1Image);

    if (card2 != null) {
      newTableau.push(card2);
      var card2Image = buildCardImage(card2, "card2");
      card2Image.setAttribute("style", calculateTabPosition(card1Image, 34, 3));
      card2Image.onmouseover = function(event) {
        showCardLabel(card2);
      };
      tab.appendChild(card2Image);
    }
  }
  return newTableau;
}

function calculateFirstCardPosition(tab) {
 var rect = tab.getBoundingClientRect();
 var position = "position: absolute; top: " + (rect.top + 20) + "px; left: " + (rect.left + 20) + "px; z-index: 1;";
 //console.log("tab: ", (rect.top+20), (rect.left+20));
 return position;
}

function calculateTabPosition(cardImage, spacing, z) {
 var rect = cardImage.getBoundingClientRect();
 var top = rect.top + spacing;
 var imgTopLen = cardImage.style.top.length - 2
 var imgTop = parseInt(cardImage.style.top.slice(0, imgTopLen)) + spacing;
 //console.log(cardImage.id, rect);
 //console.log(cardImage.style.top);
 var position = "position: absolute; top: " + imgTop + "px; left: " + rect.left + "px; z-index: " + z + ";";
 //console.log("card1", rect.top, "->", top, rect.left);
 return position;
}

function buildCardImage(card, imgClass) {
  var id = card.value + card.suit;
  var cardImage = document.createElement("img");
  cardImage.setAttribute("id", id);
  cardImage.setAttribute("src", getCardImageSrc(card));
  cardImage.setAttribute("height", 135);
  cardImage.setAttribute("width", 96);
  return cardImage;
}

// turns 11 to Jack, 12 to Queen, 13 to King, and 1 to Ace
function translateCardValue(value) {
  var cardValue = value;
  switch(value) {
    case 11:
      cardValue = "Jack";
      break;
    case 12:
      cardValue = "Queen";
      break;
    case 13:
      cardValue = "King";
      break;
    case 1:
      cardValue = "Ace";
      break;
    }
    return cardValue;
}

function getCardImageSrc(card) {
  var value = translateCardValue(card.value);
  var suit = card.suit;
  suit = suit.slice(0,1);
  switch(value) {
    case "Jack":
      value = "j";
      break;
    case "Queen":
      value = "q";
      break;
    case "King":
      value = "k";
      break;
    case "Ace":
      value = "a";
      break;
  }

  return "cards\\Oxygen-White-Deck-master\\individual\\" + value + suit + ".png";
}

function showCardLabel(card) {
  var cardLabel = document.getElementById("cardLabel");
  var cardValue = translateCardValue(card.value);
  cardLabel.innerHTML = cardValue + " of " + card.suit;
}

// set active cards, only the bottom card on each tableau should be draggable
function setActiveCards() {
  for (var i = 0; i < tableaus.length; i++) {
    for (var j = 0; j < tableaus[i].length; j++) {
      cardImgId = tableaus[i][j].value + tableaus[i][j].suit;
      cardImg = document.getElementById(cardImgId);
      cardImg.setAttribute("ondragstart", "cardDrag(event)");
      if (j == tableaus[i].length - 1) {
        //console.log("setting " + cardImgId + " true");
        cardImg.setAttribute("draggable", true);
        cardImg.setAttribute("ondragover", "allowDrop(event)");
        cardImg.setAttribute("ondrop", "moveToTableau(event)");
        cardImg.setAttribute("ondblclick", "sendToFoundation(event)");
        //cardImg.setAttribute("ondrop", "buildFoundation(event)");
      } else {
        //console.log("setting " + cardImgId + " false");
        cardImg.setAttribute("draggable", false);
      }
    }
  }
}

function cardDrag(event) {
  var tabNum = event.target.parentElement.id.substr(4);
// console.log("setting tableau to " + tabNum);
//  console.log(event);
//  console.log(event.target.previousElementSibling.id);
  event.dataTransfer.setData("cardId", event.target.id);
  event.dataTransfer.setData("tableau", tabNum);
//  console.log(event);
  if (event.target.previousElementSibling != null) {
    event.dataTransfer.setData("prevCardId", event.target.previousElementSibling.id);
  } else {
  event.dataTransfer.setData("prevCardId", "empty");
  }
}

function allowDrop(event) {
  event.preventDefault();
}

function buildFoundation(event) {
  event.preventDefault();
  // get the card
  cardId = event.dataTransfer.getData("cardId");
  tabNum = parseInt(event.dataTransfer.getData("tableau"));
  // console.log("dragging from tab-" + tabNum);
  tableau = tableaus[tabNum];
  tabLen = tableau.length;
  card = tableau[tabLen - 1];

  // get the previous card
  prevCardId = event.dataTransfer.getData("prevCardId");
  // console.log(prevCardId);

  // get foundation
  foundNum = parseInt(event.target.parentElement.id.substr(6));
  if (isNaN(foundNum)) {
  //  console.log("invalid foundation selection");
    return;
  }
  // console.log("maybe adding " + cardId + " to foundation " + foundNum);
  foundation = foundations[foundNum];
  foundLength = foundation.cards.length;
  if (foundLength == 0) {
    // I got a new foundation
    if (card.value != 1) {
      console.log("Sorry, only aces can be played empty foundations");
    } else {
      emptyCard = document.getElementById("empty-" + foundNum);
      emptyCard.removeAttribute("ondragover");
      emptyCard.removeAttribute("ondrop");
      foundation.suit = card.suit;
      foundation.cards.push(card);
      updateFoundationDOM(foundation, event.target.parentElement.id, cardId);
      card = tableau.pop();
      activateCard(prevCardId);
    }
    //console.log("dropped " + translateCardValue(card.value) + " of " + card.suit);
  } else {
    // building on an existing foundation
    if (card.suit != foundation.suit) {
      console.log("Sorry, this is the " + foundation.suit + "foundation.");
    } else if (card.value != foundation.cards[foundLength-1].value + 1) {
      console.log("Invalid play: Foundations are built from ace to king");
      console.log(card.value + " -> " + (foundation.cards[foundLength-1].value + 1));
    } else {
      foundation.cards.push(card);
      updateFoundationDOM(foundation, event.target.parentElement.id, cardId);
      card = tableau.pop();
      activateCard(prevCardId);
      if (foundation.cards.length == 13) {
        if(checkWin()) {
          window.location = "fireworks\\fireworks.html";
          incrStat("gamesWon");
        }
      }
    }
  }
}
// when a card is removed from a tableau, the card beneath it,
// if one exists, needs to be activated
function activateCard(id) {
  if (id != "empty") {
    card = document.getElementById(id);
    card.setAttribute("draggable", true);
    card.setAttribute("ondragover", "allowDrop(event)");
    card.setAttribute("ondrop", "moveToTableau(event)");
    card.setAttribute("ondblclick", "sendToFoundation(event)");
  }
}

function updateFoundationDOM(foundation, foundId, cardId) {
  foundDOM = document.getElementById(foundId);
  cardDOM = document.getElementById(cardId);
  cardPosition = calculateFoundPosition(foundDOM, foundation.cards.length);
  cardDOM.setAttribute("style", cardPosition);
  cardDOM.setAttribute("draggable", false);
  cardDOM.setAttribute("ondrop", "buildFoundation(event)");
  cardDOM.removeAttribute("ondblclick");
  foundDOM.appendChild(cardDOM);
}

function calculateFoundPosition(foundDOM, z) {
 var rect = foundDOM.getBoundingClientRect();
 var top = rect.top + 5;
 var left = rect.left + 5;
 if (z > 1) {
   cardImage = foundDOM.childNodes[1];
   //console.log(foundDOM.childNodes);
   var imgTopLen = cardImage.style.top.length - 2
   //var imgTop = parseInt(cardImage.style.top.slice(0, imgTopLen));
   top = parseInt(cardImage.style.top.slice(0, imgTopLen));
 }
 var position = "position: absolute; top: " + top + "px; left: " + left + "px; z-index: " + z + ";";
 //console.log("card1", rect.top, "->", top, rect.left);
 return position;
}

// building onto tableaus
// tableaus are build K -> A in suit, from the bottom card only.
function moveToTableau(event) {
  event.preventDefault();
  //console.log(event);
  // get the fromTableau and toTableau numbers
  fromTabNum = parseInt(event.dataTransfer.getData("tableau"));
  // console.log(event.dataTransfer.getData("tableau"));
  toTabNum = parseInt(event.target.parentElement.id.substr(4));

  // action is only required if the tab numbers differ
  if (fromTabNum != toTabNum) {
    // get the card and tableaus
    cardId = event.dataTransfer.getData("cardId");
//    console.log("dragging " + cardId + " from tab-" + fromTabNum + " to " + toTabNum);
    fromTableau = tableaus[fromTabNum];
    fromTabLength = fromTableau.length;
    card = fromTableau[fromTabLength - 1];
    // console.log("dragging " + translateCardValue(card.value) + " of " + card.suit);
    if (isNaN(toTabNum)) {
//      console.log("toTabNum is NaN");
      toTabLength = 0
    } else {
//      console.log("toTabNum is not NaN, it's " + toTabNum);
//      console.log("parsed from " + event.target.parentElement.id);
      toTableau = tableaus[toTabNum];
      toTabLength = toTableau.length;
      toTabId = event.target.parentElement.id;
    }
    // can't build on empty tableaus
    if (toTabLength > 0) {
      toCard = toTableau[toTabLength - 1];
      // can only build if card is same suit and value - 1
      if (card.suit != toCard.suit) {
        console.log("can't play " + card.suit + " on " + toCard.suit);
      } else if (card.value != (toCard.value - 1)) {
        console.log("can't play " + card.value + " on " + toCard.value);
      } else {
        // remove card from fromTableau and add to toTableau
        card = fromTableau.pop();
        toTableau.push(card);

        // make toCard undraggable and prevCardId draggable
        toCardImg = document.getElementById(event.target.id);
        toCardImg.setAttribute("draggable", false);
        toCardImg.removeAttribute("ondragover");
        toCardImg.removeAttribute("ondrop");
        toCardImg.removeAttribute("ondblclick");
        prevCardId = event.dataTransfer.getData("prevCardId");
        activateCard(prevCardId);
        updateToTableauDOM(toTableau, toTabId, cardId);
      }
    }
  }
}

function updateToTableauDOM(tableau, tabId, cardId) {
  tableauDOM = document.getElementById(tabId);

  // update tableau spacing
  var spacing = 34;
  if (tableau.length > 4) {
    spacing /= 1.25;
  }
  if (tableau.length > 6) {
    spacing /= 1.5;
  }
  prevCardDOM = tableauDOM.childNodes[0];
  for (var i = 1; i < tableau.length-1; i++) {
    cardDOM = tableauDOM.childNodes[i];
    position = calculateTabPosition(prevCardDOM, spacing, i+1);
    cardDOM.setAttribute("style", position);
    prevCardDOM = cardDOM;
  }

  // append new card to DOM
  cardDOM = document.getElementById(cardId);
  position = calculateTabPosition(prevCardDOM, spacing, tableau.length)
  cardDOM.setAttribute("style", position);
  tableauDOM.appendChild(cardDOM);
}

// send to foundation if card is double-clicked
function sendToFoundation(event) {
  // get relevant information from event before DOM gets modified
  cardId = event.target.id;
  tabId = event.target.parentElement.id;
  if (event.target.previousElementSibling == null) {
    prevCardId = "empty";
  } else {
    prevCardId = event.target.previousElementSibling.id;
  }

  tabNum = tabId.substr(4);
  // get the card
  tableau = tableaus[tabNum];
  //printTableau(tableau);
  tabLength = tableau.length;
  card = tableau[tabLength-1];

  if (card.value == 1) {
    // look for empty foundation
    emptyFoundNum = 3;
    for (var i = 0; i < foundations.length; i++) {
      if (foundations[i].suit == "None") {
        emptyFoundNum = i;
        break;
      }
    }
    foundation = foundations[emptyFoundNum];
    foundation.suit = card.suit;
    card = tableau.pop();
    foundation.cards.push(card);
    updateFoundationDOM(foundation, "found-"+emptyFoundNum, cardId);
    activateCard(prevCardId);
  } else {
    //console.log("what do you do with a " + translateCardValue(card.value) + " of " + card.suit);
    // look for a foundation with the matching suit.
    foundation = null;
    foundNum = 4;
    for (var i = 0; i < foundations.length; i++) {
      if (foundations[i].suit == card.suit) {
        foundation = foundations[i];
        foundNum = i;
      }
    }
    if (foundation != null) {
      if (card.value == foundation.cards.length + 1) {
        //console.log("can play");
        card = tableau.pop();
        foundation.cards.push(card);
        updateFoundationDOM(foundation, "found-"+foundNum, cardId);
        activateCard(prevCardId);
        //console.log("sendToFoundation: foundation.cards.length = " + foundation.cards.length);
        if (foundation.cards.length == 13) {
          if(checkWin()) {
            window.location = "fireworks\\fireworks.html";
            incrStat("gamesWon");
          }
        }
      } else {
        console.log("can't play that card: " + card.value + " on " + foundation.cards.length);
        //printTableau(tableau);
      }
    }
  }
}

// if redeal is clicked, gathered all cards in tableaus, shuffle, and
// redistribute them.
function reDeal(event) {
  //console.log(event);
  // build deck from cards in tableaus
  var deck = new Array();
  for (var i = 0; i < tableaus.length; i++) {
    tableau = tableaus[i];
    for (var j = 0; j < tableau.length; j++) {
      deck.push(tableau[j]);
    }
  }
  deck = shuffleDeck(deck);
  deal(deck);
}

// check for win condition
function checkWin() {
  var winner = true;
  for (var i = 0; i < foundations.length; i++) {
    if (foundations[i].cards.length < 13) {
      winner = false;
      break;
    }
  }
  return winner;
}

function updateRemainingDeals() {
  dealsRemaining--;
  dealsP = document.getElementById("dealsRemaining");
  dealsP.innerHTML = "Deals Left: " + dealsRemaining;
  if (dealsRemaining == 0) {
    dealImgDOM = document.getElementById("deal");
    dealImgDOM.setAttribute("src", "cards\\newgame.png");
    dealImgDOM.setAttribute("onclick", "newGame(event)");
  }
}

function newGame(event) {
  dealsRemaining = 4;
  dealImgDOM = document.getElementById("deal");
  dealImgDOM.setAttribute("src", "cards\\redeal.png");
  dealImgDOM.setAttribute("onclick", "reDeal(event)");
  init();
}

// local storage statistics tracking
// let's track gamesPlayed and gamesWon
function incrStat(key) {
  var stat = localStorage.getItem(key);
  if (!stat) {
    stat = 0;
    localStorage.setItem(key, stat);
  } else {
    stat = parseInt(stat);
  }
  stat++;
  localStorage.setItem(key, stat);
}

function updateStatsDOM() {
  resetButton = document.getElementById("reset");
  statsDOM = document.getElementById("stats");
  wins = localStorage.getItem("gamesWon");
  if (!wins) {
    wins = 0;
    localStorage.setItem("gamesWon", 0);
  } else {
    wins = parseInt(wins);
  }
  played = parseInt(localStorage.getItem("gamesPlayed"));
  winPercent = Math.round(100 * wins / played);
  statsStr = played + " game";
  if (played > 1) {
    statsStr = statsStr + "s"
  }
  statsStr = statsStr + " played, " + wins + " won (" + winPercent + "%)  ";
  statsDOM.innerHTML = statsStr;
  statsDOM.appendChild(resetButton);
}

function resetStats(event) {
  localStorage.setItem("gamesWon", 0);
  localStorage.setItem("gamesPlayed", 1);
  updateStatsDOM();
}


function init() {
  // shuffle 52 cards (4 suits, 13 per suit)
  var deck = shuffleDeck(buildDeck());
  // prepare the foundations and foundation DOMs
  foundations = [];
  for (var i = 0; i < 4; i++) {
    foundations[i] = new Foundation();
    foundDOM = document.getElementById("found-"+i);
    foundDOM.innerHTML = "";
    emptyImgDOM = document.createElement("img");
    emptyImgDOM.setAttribute("id", "empty-"+i);
    emptyImgDOM.setAttribute("class", "emptyFoundation");
    emptyImgDOM.setAttribute("src", "cards\\emptyFoundation.png");
    emptyImgDOM.setAttribute("height", "135");
    emptyImgDOM.setAttribute("width", "96");
    emptyImgDOM.setAttribute("ondragover", "allowDrop(event)");
    emptyImgDOM.setAttribute("ondrop", "buildFoundation(event)");
    foundDOM.appendChild(emptyImgDOM);
  }
  // deal
  deal(deck);
  incrStat("gamesPlayed");
  updateStatsDOM();
}

window.onload = init;

// for debugging
function printTableau(tab) {
  for (var i = 0; i < tab.length; i++) {
    console.log(translateCardValue(tab[i].value) + " of " + tab[i].suit);
  }
}
