const {
    airDropSol,
    getWalletBalance,
    transferSOL,
    tranactionMaker,
    _recoverKeyFor
} = require("./solana");
const {
    randomNumber,
    getReturnAmount,
    totalAmtToBePaid
} = require("./helper");
const prompt = require('prompt');
const devKeyFilePath = "../dev-wallet-sk.key";
const treasuryWallet = "../treasury-sk.key";

// Generate a new wallet Key Pair
const userWallet = _recoverKeyFor(devKeyFilePath);
const gameExecution = async() => {
    const tres = _recoverKeyFor(treasuryWallet);
    prompt.start();
    let playerRes = await prompt.get(['Want to play a Game? (Y/n)']);
    playerRes = Object.values(playerRes)[0].charAt(0);
    while (playerRes != 'n'){
        let maxVal, wager;
        const bal = await getWalletBalance(userWallet.publicKey);
        console.log(`User Balance: ${bal}`)
        while(true){
            gameParams = await prompt.get([
                'What is the range you want to guess at? (Larger ranges payout higher rewards, min 5) 1 to ..',
                'What is your wager? Value between 1 & 0.05:'
            ]);
            maxVal = parseInt(Object.values(gameParams)[0]);
            wager = parseFloat(Object.values(gameParams)[1]);
            if (isNaN(maxVal)){
                console.log('Unable to parse Int Try Again')
            } else if (isNaN(wager)){
                console.log('Unable to parse Float Try Again')
            } else if (maxVal < 5){
                console.log('Range must be at least 5')
            } else if (wager > 1 || wager < 0.05){
                console.log(`You entered: ${wager} value must between 0.05 - 1 SOL`)
            } else if (wager > bal){
                console.log(`Player Balance is ${bal}, select a wager under your balance`)
            }else {
                break;
            }
        }
        const reward = getReturnAmount(maxVal, wager)
        confirmPlay = await prompt.get(`You are putting ${wager} SOL on the line, if you guess correctly you will get ${reward} SOL (y/N):`);
        if (Object.values(confirmPlay)[0].toLowerCase().charAt(0) == 'y'){
            console.log('Collecting wager...', wager)
            const sig = await transferSOL(userWallet, tres, wager);
            console.log('Signature', sig)
            console.log('Transfer Completed');
            const userGuessRes = await prompt.get({
                name: `Place your guess, between 1 & ${maxVal}(inclusive):`,
                required: true,
                type: 'integer'
            });
            const userGuess = Object.values(userGuessRes)[0];
            const winningNum = randomNumber(1, maxVal);
            console.log(`Winning number: ${winningNum}`);
            if(userGuess == winningNum){
                console.log('You win, Congrats. Transfering your reward...');
                console.log('Thank you for Playing! Winnings Sig:', await transferSOL(tres, userWallet, reward));
            } else {
                console.log('Better luck next time. Sorry you lost.');
            }
        }
        
        // Ask if the player wants to play another round
        playerRes = await prompt.get(['Want to play another round? (Y/n)']);
        playerRes = Object.values(playerRes)[0].charAt(0);
    }
    console.log('Ending Player Balance:', await getWalletBalance(userWallet.publicKey))
}

gameExecution().then(()=> {
    console.log("Game exit");
})
.catch( e => {
    console.error(e);
})