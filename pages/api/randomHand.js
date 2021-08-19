// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// import { suits, cardName, fullDeck, handRank, handValue, possibleHands } from "../poker"
import { cardName, fullDeck, handRank, handValue, possibleHands } from "../poker"

export default ( request, response ) => {
  const newDeck = fullDeck( 1 );
  const newHand = newDeck.splice( 0, 4 );
  const allPossibleHands = possibleHands( newHand, 5 );
  response.status( 200 ).json( {
    hand: newHand,
    deck: newDeck,
    cardNames: newHand.map( cardName ),
    rank: handRank( newHand ),
    value: handValue( newHand ),
  } );
}
