const { flushes, fiveUniqueCards, hashAdjust, hashValues } = require( "./lookupTables" );

exports.suits = { 8: "Clubs", 4: "Diamonds", 2: "Hearts", 1: "Spades" };
const rankPrimes = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41 ];

const rank = card => ( card >>> 8 ) % 16;
const suit = card => ( card >>> 12 ) % 16;

const rankNames = [ "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace" ];
const suitNames = [ null, "Spades", "Hearts", null, "Diamonds", null, null, null, "Clubs" ];
exports.cardName = card => `${ rankNames[ rank( card ) ] } of ${ suitNames[ suit( card ) ] }`;

exports.fullDeck = shuffled => {
    const result = [];
    for ( let rank = 0; rank < 13; rank++ ) for ( let suit of [ 8, 4, 2, 1 ] )
        result.push( ( rankPrimes[ rank ] ) | ( rank << 8 ) | ( suit << 12 ) | ( ( 1 << rank ) << 16 ) );
    if ( !shuffled ) return result;
    for ( let i = 51; i > 0; i-- ) {
        const j = Math.floor( Math.random() * ( i + 1 ) );
        [ result[ i ], result[ j ] ] = [ result[ j ], result[ i ] ];
    }
    return result;
}

const isFlush = hand => hand.reduce( ( total, card ) => total & card, 0xF000 );

const flushBitPattern = flush => flush.reduce( ( total, card ) => total | card , 0 ) >>> 16;
const flushRank = flush => flushes[ flushBitPattern( flush ) ];
const fiveUniqueCardsRank = hand => fiveUniqueCards[ flushBitPattern( hand ) ];
const primeMultiplicand = hand => hand.reduce( ( total, card ) => total * ( card & 0xFF ), 1 );

const findFast = u => {
    u += 0xe91aaa35;
    u ^= u >>> 16;
    u += u << 8;
    u ^= u >>> 4;
    let a  = ( u + ( u << 2 ) ) >>> 19;
    return a ^ hashAdjust[ ( u >>> 8 ) & 0x1ff ];
};

exports.handRank = hand => {
    if ( isFlush( hand ) ) return flushRank( hand );
    let fiveUniqueCards = fiveUniqueCardsRank( hand );
    if ( fiveUniqueCards ) return fiveUniqueCards;
    return hashValues[ findFast( primeMultiplicand( hand ) ) ];
};

exports.handValue = hand => {
    const value = this.handRank( hand );
    if ( value > 6185 ) return "High card";
    else if ( value > 3325 ) return "One pair";
    else if ( value > 2467 ) return "Two pair";
    else if ( value > 1609 ) return "Three of a kind";
    else if ( value > 1599 ) return "Straight";
    else if ( value > 322 )  return "Flush";
    else if ( value > 166 )  return "Full house";
    else if ( value > 10 )   return "Four of a kind";
    else return "Straight flush";
};

exports.possibleHands = ( deck, combinationLength ) => {
    let head, tail, result = [];
    if ( combinationLength > deck.length || combinationLength < 1 ) { return []; }
    if ( combinationLength === deck.length ) { return [ deck ]; }
    if ( combinationLength === 1 ) { return deck.map( element => [ element ] ); }
    for ( let i = 0; i < deck.length - combinationLength + 1; i++ ) {
      head = deck.slice( i, i + 1 );
      tail = this.possibleHands( deck.slice( i + 1 ), combinationLength - 1 );
      for ( let j = 0; j < tail.length; j++ ) { result.push( head.concat( tail[ j ] ) ); }
    }
    return result;
}
