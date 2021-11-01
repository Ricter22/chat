//users list
const users= [];

function newUserList(user){
    users.push(user);
    return users;
}

function removedUserList(user){
    const index = users.indexOf(user);
    users.splice(index, 1);
    return users;
}

module.exports = {
    removedUserList : removedUserList,
    newUserList : newUserList,
    users : users
}