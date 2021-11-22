countries = ['brasil', 'italy', 'spain', 'germany', 'france', 'netherlands', 'uk', 'sweden'];

function Parsing(text){
    let list = [];
    let msg = '';
    words = text.split('@');
    words.forEach(word =>{
        msg += word;
    })
    words.forEach(word => {
        if (countries.includes(word.toLowerCase())){
            list.push('https://en.wikipedia.org/wiki/' + word);
        }
    })
    return objects = [list, msg];
}


module.exports = {
    Parsing : Parsing
}

