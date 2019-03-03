let toBeDeleted = '123'

let account = {
    user: 'userId',
    lists: [{id:'123'}, {id:'2'}, {id:'3'}]
}

let newLists = account.lists.reduce((acc, val, index) => {
    if(JSON.stringify(account.lists[index]) !== toBeDeleted){
        account.lists.splice(index, 1)
    };
    return acc
}, account.lists)
console.log(newLists)