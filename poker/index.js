const Geco  = require( "geco" );

const { flushes, fiveUniqueCards, hashAdjust, hashValues } = require( "./lookupTables" );

const AVG_5CARD_HAND_VALUE = 5618.888055222089;

exports.suits = { 8: "Clubs", 4: "Diamonds", 2: "Hearts", 1: "Spades" };
const rankPrimes = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41 ];

const rank = card => ( card >>> 8 ) % 16;
const suit = card => ( card >>> 12 ) % 16;

const rankNames = [ "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace" ];
const suitNames = [ null, "Spades", "Hearts", null, "Diamonds", null, null, null, "Clubs" ];
exports.cardName = card => `${ rankNames[ rank( card ) ] } of ${ suitNames[ suit( card ) ] }`;

const deck = [
    98306,     81922,     73730,     69634,
    164099,    147715,    139523,    135427,
    295429,    279045,    270853,    266757,
    557831,    541447,    533255,    529159,
    1082379,   1065995,   1057803,   1053707,
    2131213,   2114829,   2106637,   2102541,
    4228625,   4212241,   4204049,   4199953,
    8423187,   8406803,   8398611,   8394515,
    16812055,  16795671,  16787479,  16783383,
    33589533,  33573149,  33564957,  33560861,
    67144223,  67127839,  67119647,  67115551,
    134253349, 134236965, 134228773, 134224677,
    268471337, 268454953, 268446761, 268442665
];

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

// const combinations = ( cardSet, combinationLength ) => {
//     let head, tail, result = [];
//     if ( combinationLength > cardSet.length || combinationLength < 1 ) { return []; }
//     if ( combinationLength === cardSet.length ) { return [ cardSet ]; }
//     if ( combinationLength === 1 ) { return cardSet.map( card => [ card ] ); }
//     for ( let i = 0; i < cardSet.length - combinationLength + 1; i++ ) {
//         head = cardSet.slice( i, i + 1 );
//         tail = combinations( cardSet.slice( i + 1 ), combinationLength - 1 );
//         for ( let j = 0; j < tail.length; j++ ) { result.push( head.concat( tail[ j ] ) ); }
//     }
//     return result;
// }

// const possibleHolds = hand => [ ...Array( hand.length + 1 ).keys() ].slice( 1 ).reduce( ( result, holdLength ) =>
//     [ ...result, ...combinations( hand, holdLength ) ], []
// );

// exports.allHolds = hand => {
//     const holdPossibilities = Object.fromEntries( possibleHolds( hand ).map( hold => {
//         // hold.sort( ( a, b ) => a - b );
//         const possibleHands = combinations( deck.filter( card => !hold.includes( card ) ), hand.length - hold.length );
//         return [
//             hold, possibleHands.reduce( ( result, possibleHand ) => result + this.handRank( [ ...hold, ...possibleHand ] ), 0 ) / possibleHands.length
//         ];
//     } ) );
//     holdPossibilities[ "" ] = AVG_5CARD_HAND_VALUE;
//     holdPossibilities[ hand.join() ] = this.handRank( hand );
//     return holdPossibilities;
// };

exports.allHolds = hand => {
    // const holdPossibilities = {};
    // for ( const possibleHold of Geco.gen() ) {}
    const allPossibleHolds = [ ...Array( hand.length + 1 ).keys() ].slice( 1 ).reduce( ( result, holdLength ) =>
        [ ...result, ...Geco.gen( hand.length, holdLength, hand ) ]
    , [] );
    const holdPossibilities = Object.fromEntries( allPossibleHolds.map( hold => {
        let averageHandValueForThisHold = 0;
        const deckForThisHold = deck.filter( card => !hold.includes( card ) );
        for ( const possibleHand of Geco.gen( deckForThisHold.length, hand.length - hold.length, deckForThisHold ) ) averageHandValueForThisHold += this.handRank( [ ...hold, ...possibleHand ] );
        return [ hold, averageHandValueForThisHold / Geco.cnt( deckForThisHold.length, hand.length - hold.length ) ];
    } ) );
    return { ...holdPossibilities, "": AVG_5CARD_HAND_VALUE };
};

// const test = [ ...Geco.gen( 5, 3, [ 0,1,2,3,4 ] ) ];
// console.log( test );
