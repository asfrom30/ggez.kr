/* app utils */
const crawlAndSave = require('../../../../externals').crawlAndSave;
const appDao = require('../../../services/dao');
const momentService = require('../../../services/moment.core.service');

exports.findById = function(req, res, next, id) {

    const device = req.device;
    const region = req.region;
    id = Number.parseInt(id);

    appDao.findPlayerById(device, region, id).then(player => {
        req.player = player;
        next();
    })
}

exports.query = function(req, res, next) {
    const device = req.device;
    const region = req.region;
    const btg = req.query.btg;
    const startsWith = req.query.startsWith;
    const ids = req.query.ids;

    if(btg !== undefined) {
        appDao.findPlayerByBtg(device, region, btg).then(player =>{
            sendPlayer(res, player);
            return;
        }).catch(reason => {
            res.status(500).send(reason);
            return;
        });
    } else if(startsWith !== undefined) {
        const regex = `^${startsWith}`;
        appDao.findPlayerByRegex(device, region, regex).then(player => {
            sendPlayer(res, player);
            return;
        }).catch(reason => {
            res.status(500).send(reason);
            return;
        });
    } else if(ids !== undefined) {
        let arrIds = ids.split(",");
        arrIds = arrStringToInt(arrIds);
        appDao.findPlayerByIds(device, region, arrIds).then(players => {
            res.json({err : '', msg : 'success', value : {players : players}});
        }, reason => {
            res.status(500).json({err : reason, msg : '', value : ''});
        });
    }else {
        res.status(404).json({err : 'query is not defined'});
    }
} 

function arrStringToInt(arrIds) {
    let result = [];
    for(let id of arrIds) {
        const temp = parseInt(id);
        if(Number.isInteger(temp)) result.push(temp);
    }
    return result;
}

exports.read = function(req, res, next) {
    sendPlayer(res, req.player);
}

exports.register = function(req, res, next) {
    const device = req.device;
    const region = req.region;
    const btg = req.body.btg;

    if(btg == undefined) {
        res.status(404).send({err: 'target_btg_which_you_wish_to register_is_undefined'});
        return;
    }

    Promise.resolve().then(() => {
        return appDao.findPlayerByBtg(device, region, btg);
    }).then((player) => {
        if(player != undefined) {
            res.status(409).json({msg : '', err: 'target_resource_is_already_exist', value :{}})
            return Promise.reject(409);
        }
        return crawlAndSave.onlyCrawlForRegister(device, region, btg);
    }).then(crawlData => {
        if(crawlData == undefined || (Object.keys(crawlData).length === 0 && crawlData.constructor === Object)) {
            res.status(400).json({msg : '', err: 'this_battle_tag_is_not_exist_in_overwatch_reason', value :{}});
            return Promise.reject(400);
        }
        return appendNewPlayerId(device, region, crawlData);
    }).then(crawlDataWithId => {
        return saveAll(device, region, btg, crawlDataWithId);
    }).then(id => {
        const player = {};
        player._id = id;
        res.status(200).json({msg : 'register battle tag is success', err : '', value : player});
    }).catch((reason) => {
        if(reason == undefined) console.log('reason is undefined');
        if(Number.isInteger(reason)) {
            // nothing to do, res is sended already
        } else {
            console.log(reason); // reason log for server
            res.status(500).json({err : 'internal server error'}); // reason for client;
        }
    });
}

function findByBtg(device, region, btg){
    const Player = require('mongoose').model(`Players_${device}_${region}`);
    
    return new Promise((resolve, reject) => {
        Player.findOne({ btg : btg }, function(err, player) {
            if(err) {
                reject(err)
                return;
            } 
            resolve(player);
        });
    })
}

function sendPlayer(res, player) {
    if(player == undefined) res.status(404).json({ msg : '', err : 'resource_is_not_exist_which_you_find', value : {}});
    else res.status(200).json({msg : 'send player success', err : '', value : player});
}

//FIXME: if counter collection is not exist, upsert : true;
function appendNewPlayerId(device, region, crawlData) {
    return new Promise((resolve, reject) => {
        appDao.getNewPlayerId('pc', 'kr').then(id => {
            crawlData._id = id;
            resolve(crawlData);
        }, reason => {
            reject(reason);
        })
    })
}

function saveAll(device, region, btg, crawlData){
    return appDao.insertPlayer(device, region, getPlayerObj(btg, crawlData)).then(result => {
        return result;
    }).then(id => {
        let promises = [];
        promises.push(appDao.updateCurrentCrawlData(device, region, id, crawlData));
        promises.push(appDao.updateTodayCrawlData(device, region, id, crawlData));
        return Promise.all(promises).then(() => {
            return id;
        });
    })
}

function getPlayerObj(btg, crawlData) {
    let result = {};
    result.btg = btg;
    result.btn = btg.substring(0, btg.indexOf('-'));
    result.iconUrl = crawlData._meta.iconUrl;
    result.level = crawlData._meta.lowerLevel
    result.cptpt = crawlData._meta.cptpt;

    //FIXME: comment count, star count, thumb coutn = 0;

    result.lastUpdateTimeStamp = Date.now();
    result.registerTimeStamp = Date.now();

    return result;
}
