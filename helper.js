exports.randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

exports.getReturnAmount = (max, wager) => {
    const percentGain = 1 + (max / 100);
    return wager * percentGain;
}

exports.totalAmtToBePaid = () => {}