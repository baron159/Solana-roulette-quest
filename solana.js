const web3 = require("@solana/web3.js");
const fs = require("fs");

/**
 * @exports
 * @async function for dropping to Sol to a wallet
 * @param {Uint8Array} sercret the wallet to air drop too
 * @returns {boolean} True or False based on success of the drop
 */
 exports.airDropSol = async(sercret) => {
    try{
        const conn = new web3.Connection(clusterApiUrl("devnet"), "confirmed");
        const walletKeyPair = await web3.Keypair.fromSecretKey(sk);
        console.log("-- Air Dropping 2 Sol --");
        const fromAirDropSig = await conn.requestAirdrop(
            new PublicKey(walletKeyPair.publicKey),
            2 * web3.LAMPORTS_PER_SOL
        );
        await conn.confirmTransaction(fromAirDropSig);
        return true;
    }
    catch(err){
        console.error(err);
        return false;
    }
}


/**
 * @async Fn for getting the wallet balance
 * @param {web3.PublicKeyInitData} pubKey the public key to query the balance for
 * @returns {Promise<Number>} returns the number of SOL =(#/LAMPORTS)
 * @throws Connection Error (?) | Balance Retreve Error (?)
 */
 exports.getWalletBalance = async(pubKey) => {
    try{
        const conn = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
        const balance = await conn.getBalance(new web3.PublicKey(pubKey));
        return balance / web3.LAMPORTS_PER_SOL;
    }
    catch(err){
        console.error(err);
        // a check could be inserted to see if its a recoverable error
        throw err;
    }
    
}

/**
 * @async function that creates a signature transfer transaction
 * @param {web3.Signer} from The wallet that is committing the Sol Transfer [wallet instance]
 * @param {web3.Signer} to The wallet recieving the Sol Transfer [wallet instance]
 * @param {Number} transferAmt The amount of Sol being transfered
 * @returns {Promise<String>} The signature represented in the form of string, upon successful request
 * @throws Signing error
 */
 exports.transferSOL = async(from, to, transferAmt) => {
    try{
        const conn = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
        const transaction = tranactionMaker(from, to, transferAmt);
        const sig = await web3.sendAndConfirmTransaction(conn, transaction, [from])
        return sig;
    }
    catch(err){
        console.error(err);
        throw err;
    }
}

/**
 * @private
 * Supporting function to wrap creds in a transaction and return the newly created function
 * @param {web3.Keypair} to Key of the wallet that the SOL will end in
 * @param {web3.Keypair} from Key of the wallet that the SOL is coming from
 * @param {Number} amt Amount of SOL that is beinging transfered
 * @returns {web3.Transaction}
 */
 const tranactionMaker = (from, to, amt) => {
    const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: new web3.PublicKey(from.publicKey.toString()),
            toPubkey: new web3.PublicKey(to.publicKey.toString()),
            lamports: amt * web3.LAMPORTS_PER_SOL
        })
    );
    return transaction;
}

// NOTE: The following line can be used to create a wallet ref from store
// const userWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
/**
 * @sync function
 * Developement support function for looking in a file for a sercret key, otherwise create it
 * @param {String} fileName name of the file to check contents & attempt parse for
 * @returns {web3.Keypair} newly created or recovered wallet
 * @error File not present, program will exit if this case is hit
 */
 exports._recoverKeyFor = (fileName) => {
    // This is a dev function for recovering the wallet key
    let keyObj = null;
    try {
        const data = fs.readFileSync(fileName, "utf8");
        const parsedArray = Uint8Array.from(data.split(','));
        if (parsedArray.length != 64){
            const newPair = new web3.Keypair();
            fs.writeFileSync(fileName, newPair._keypair.secretKey.toString())
            keyObj = newPair
        }
        else{
            keyObj = web3.Keypair.fromSecretKey(parsedArray);
        }
    }
    catch(err){
        console.error(err);
        console.log(`Hit a error during reading. Is the a key file present? if not please preform touch cmd and start again; File & Loc:: ${fileName}`);
        process.exit(); // In production this shoould probably not be called like this
    }
    return keyObj;
}