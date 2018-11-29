const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname,'db.json');

module.exports = class DataBase {
    constructor(){
        this._record = fs.readFileSync(dbPath, 'utf-8');
        this._data = JSON.parse(this._record);
        this._users = this._data.users;
        this._usersData = this._data.usersData;
        this._defaultCategory = [
            {
                "catName": "alco",
                "title" : "Алкогольні напої",
                "data": []
            },
            {
                "catName": "noAlco",
                "title" : "Безалкогольні напої",
                "data": []
            },
            {
                "catName": "salad",
                "title" : "Салати",
                "data": []
            },
            {
                "catName": "first",
                "title" : "Перші страви",
                "data": []
            },
            {
                "catName": "sup",
                "title" : "Супи",
                "data": []
            },
            {
                "catName": "pizza",
                "title" : "Піца",
                "data": []
            },
            {
                "catName": "sushi",
                "title" : "Суші",
                "data": []
            }
        ];
    }

    getUser(key) {
        return new Promise((resolve, reject) =>{
            let user = this._users.find(item => item.key === key);
            if(user){
                resolve(user);
            } else {
                reject('User not found');
            }
        });
    }
    updateUser(key, user) {
        return new Promise((resolve, reject) =>{
            let id = this._users.findIndex(item => item.key === key );
            if (id >= 0){
                this._users.splice(id, 1, user);
                fs.writeFile(dbPath,JSON.stringify(this._data),'utf-8', () => {
                    resolve('User was edited');
                });
            } else {
                reject('User not found');
            }
        });
    }

    getData(key, category, index) {
        return new Promise((resolve, reject) =>{
            let keyData = this._usersData.find(item => item.key === key);
            if(keyData){
                if(category){
                    let needCategory = keyData.categories.find(item => item.catName === category);
                    if (needCategory){
                        if(index){
                            let needItem = needCategory.data.find(item => item.id === Number(index));
                            if (needItem){
                                resolve(needItem)
                            } else {
                                reject('Item not found')
                            }
                        } else {
                            resolve(needCategory.data);
                        }
                    }
                    else {
                        reject('Category not found');
                    }
                } else {
                    let categoryList = [];
                    keyData.categories.forEach(item => categoryList.push(
                        {
                            "category": item.catName,
                            "title": item.title
                        }));
                    if(categoryList.length) {
                        resolve(categoryList);
                    } else{
                        reject('no category')
                    }
                }
            } else {
                reject('Invalid key');
            }
        });
    }

    authorization(item) {
        return new Promise((resolve, reject) => {
            let user = this._users.find(user => user.email === item.email);
            if(user){
                if(user.password === item.password){
                    resolve(`${user.email}${user.password}`);
                } else {
                    reject('Invalid password');
                }
            } else {
                reject('User not found');
            }
        });
    }

    registration(item) {
        return new Promise((resolve, reject) => {
            if(this._users.find(user => user.email === item.email)) {
                reject(`Користувач з таким E-mail: ${item.email} вже існує`);
            }
            else {
                let userData = {
                    'key': `${item.email}${item.password}`,
                    'categories': this._defaultCategory
                };
                item.key = `${item.email}${item.password}`;
                this._usersData.push(userData);
                this._users.push(item);

                fs.writeFile(dbPath, JSON.stringify(this._data),'utf-8', () => {
                    console.log('New user was create');
                    resolve('Створено нового користувача');
                });
            }
        });
    }

    post(key, category, item){
        return new Promise((resolve, reject) => {
            let keyData = this._usersData.find(item => item.key === key);
            if(keyData) {
                let needCategory = keyData.categories.find(item => item.catName === category);
                if (needCategory) {
                    item.id = needCategory.data.length+1;
                    needCategory.data.unshift(item);
                    fs.writeFile(dbPath, JSON.stringify(this._data),'utf-8', (err) => {
                        if(err){
                            reject('error');
                        }
                        console.log('New item was write');
                        resolve('OK');
                    });
                }
            }
        });
    }

    put(key, category, editIndex, editItem) {
        return new Promise(((resolve, reject) => {
            let keyData = this._usersData.find(item => item.key === key);
            if(keyData){
                let needCategory = keyData.categories.find(item => item.catName === category);
                if (needCategory){
                    let id = -1;
                    needCategory.data.find((item, index) => {
                        if(item.id === Number(editIndex)){
                            id = index;
                        }
                    });
                    if(id >= 0) {
                        needCategory.data.splice(id,1,editItem);
                        fs.writeFile(dbPath,JSON.stringify(this._data),'utf-8', () => {
                            resolve('Item was edited');
                        });
                    }
                    else {
                        reject('Item not found');
                    }
                }else {
                    reject('Category not found');
                }
            }else {
                reject('Invalid key');
            }
        }));
    }

    del(key, category, delIndex){
        return new Promise(((resolve, reject) => {
            let keyData = this._usersData.find(item => item.key === key);
            if(keyData){
                let needCategory = keyData.categories.find(item => item.catName === category);
                if (needCategory){
                    let id = -1;
                    needCategory.data.find((item, index) => {
                        if(item.id === Number(delIndex)){
                            id = index;
                        }
                    });
                    if(id >= 0) {
                        needCategory.data.splice(id,1);
                        fs.writeFile(dbPath,JSON.stringify(this._data),'utf-8', () => {
                            resolve('Item was deleted');
                        });
                    }
                    else {
                        reject('Item not found');
                    }
                }else {
                    reject('Category not found');
                }
            }else {
                reject('Invalid key');
            }
        }));
    }

};

