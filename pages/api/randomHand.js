import { cardName, fullDeck, handRank, handValue, allHolds } from "../../poker"

export default ( request, response ) => {
  const newDeck = fullDeck( 1 );
  const newHand = newDeck.splice( 0, 5 );
  const holds = allHolds( newHand );
  response.status( 200 ).json( {
    hand: newHand,
    // deck: newDeck,
    cardNames: newHand.map( cardName ),
    rank: handRank( newHand ),
    value: handValue( newHand ),
    bestHold: Object.keys( holds ).reduce( ( thisHold, thatHold ) => holds[ thisHold ] < holds[ thatHold ] ? thisHold : thatHold ).split( "," ).map( Number ),
    allHolds: holds
  } );
}
